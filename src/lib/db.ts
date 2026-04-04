import { openDB, type IDBPDatabase } from "idb";
import type { Expense, NameMapping } from "./types";
import { supabase } from "./supabase";

const DB_NAME = "expense-tracker";
const DB_VERSION = 2;
const STORE_EXPENSES = "expenses";
const STORE_MAPPINGS = "name_mappings";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Expenses store
        if (!db.objectStoreNames.contains(STORE_EXPENSES)) {
          const expenseStore = db.createObjectStore(STORE_EXPENSES, { keyPath: "id" });
          expenseStore.createIndex("by-month", ["userId", "year", "month"]);
          expenseStore.createIndex("by-user", "userId");
        }
        
        // Name mappings store
        if (!db.objectStoreNames.contains(STORE_MAPPINGS)) {
          const mappingStore = db.createObjectStore(STORE_MAPPINGS, { keyPath: "id" });
          mappingStore.createIndex("by-user", "userId");
        }
      },
    });
  }
  return dbPromise;
}

// ========== EXPENSES ==========

export async function getExpensesByMonth(
  userId: string,
  year: number,
  month: number
): Promise<Expense[]> {
  try {
    // Try from Supabase first
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .eq("year", year)
      .eq("month", month)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Cache to IndexedDB
      const db = await getDB();
      const tx = db.transaction(STORE_EXPENSES, "readwrite");
      for (const expense of data) {
        await tx.store.put(mapExpenseFromDB(expense));
      }
      await tx.done;
      
      return data.map(mapExpenseFromDB);
    }
  } catch (e) {
    console.warn("Supabase error, falling back to IndexedDB:", e);
  }

  // Fallback to IndexedDB
  const db = await getDB();
  const expenses = await db.getAllFromIndex(
    STORE_EXPENSES,
    "by-month",
    [userId, year, month]
  );
  return expenses.sort((a, b) => b.createdAt - a.createdAt);
}

export async function addExpense(expense: Expense): Promise<void> {
  try {
    // Add to Supabase
    await supabase.from("expenses").insert([mapExpenseToDB(expense)]);
  } catch (e) {
    console.warn("Supabase insert failed, saving to IndexedDB only:", e);
  }

  // Also save to IndexedDB
  const db = await getDB();
  await db.add(STORE_EXPENSES, expense);
}

export async function deleteExpense(id: string): Promise<void> {
  try {
    await supabase.from("expenses").delete().eq("id", id);
  } catch (e) {
    console.warn("Supabase delete failed:", e);
  }

  const db = await getDB();
  await db.delete(STORE_EXPENSES, id);
}

export async function updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
  try {
    await supabase
      .from("expenses")
      .update(mapExpenseToDB(updates as Expense))
      .eq("id", id);
  } catch (e) {
    console.warn("Supabase update failed:", e);
  }

  const db = await getDB();
  const expense = await db.get(STORE_EXPENSES, id);
  if (expense) {
    await db.put(STORE_EXPENSES, { ...expense, ...updates });
  }
}

export interface MonthSummary {
  month: number;
  year: number;
  total: number;
  count: number;
}

export async function getPastMonths(
  userId: string,
  currentMonth: number,
  currentYear: number
): Promise<MonthSummary[]> {
  try {
    // Try Supabase first
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId);

    if (!error && data) {
      return aggregateMonthsSummary(data.map(mapExpenseFromDB), currentMonth, currentYear);
    }
  } catch (e) {
    console.warn("Supabase getPastMonths failed:", e);
  }

  // Fallback to IndexedDB
  const db = await getDB();
  const allExpenses = await db.getAllFromIndex(STORE_EXPENSES, "by-user", userId);
  return aggregateMonthsSummary(allExpenses, currentMonth, currentYear);
}

// ========== NAME MAPPINGS ==========

export async function getUserNameMappings(userId: string): Promise<NameMapping[]> {
  // Primero intentar cargar desde IndexedDB (fuente local de verdad)
  const db = await getDB();
  const localMappings = await db.getAllFromIndex(STORE_MAPPINGS, "by-user", userId);
  
  // Intentar sincronizar con Supabase en background (no blocking)
  try {
    const { data } = await supabase
      .from("name_mappings")
      .select("*")
      .eq("user_id", userId);

    if (data && data.length > 0) {
      // Si hay mappings en Supabase, sincronizar a IndexedDB
      const tx = db.transaction(STORE_MAPPINGS, "readwrite");
      for (const mapping of data) {
        await tx.store.put(mapMappingFromDB(mapping));
      }
      await tx.done;
      
      // Retornar los de Supabase (más actualizados)
      return data.map(mapMappingFromDB);
    }
  } catch (e) {
    console.warn("Supabase mappings sync error:", e);
    // No tirar error, usar lo que tenemos en IndexedDB
  }

  // Retornar lo que tenemos en IndexedDB
  return localMappings;
}

export async function addNameMapping(mapping: NameMapping): Promise<void> {
  try {
    await supabase.from("name_mappings").insert([mapMappingToDB(mapping)]);
  } catch (e) {
    console.warn("Supabase mapping insert failed:", e);
  }

  const db = await getDB();
  await db.add(STORE_MAPPINGS, mapping);
}

export async function deleteNameMapping(id: string): Promise<void> {
  try {
    await supabase.from("name_mappings").delete().eq("id", id);
  } catch (e) {
    console.warn("Supabase mapping delete failed:", e);
  }

  const db = await getDB();
  await db.delete(STORE_MAPPINGS, id);
}

// ========== HELPERS ==========

function aggregateMonthsSummary(
  expenses: Expense[],
  currentMonth: number,
  currentYear: number
): MonthSummary[] {
  const grouped: Record<string, MonthSummary> = {};

  for (const expense of expenses) {
    // Skip current month
    if (expense.year === currentYear && expense.month === currentMonth) continue;
    // Skip future months
    if (
      expense.year > currentYear ||
      (expense.year === currentYear && expense.month > currentMonth)
    )
      continue;

    const key = `${expense.year}-${expense.month}`;
    if (grouped[key]) {
      grouped[key].total += expense.amount;
      grouped[key].count += 1;
    } else {
      grouped[key] = {
        month: expense.month,
        year: expense.year,
        total: expense.amount,
        count: 1,
      };
    }
  }

  return Object.values(grouped).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
}

// DB → Runtime mapping (snake_case → camelCase)
function mapExpenseFromDB(dbExpense: Record<string, unknown>): Expense {
  const createdAt = dbExpense.created_at;
  let createdAtTime: number;
  
  if (typeof createdAt === 'number') {
    createdAtTime = createdAt;
  } else {
    // Assume it's an ISO string from Supabase
    createdAtTime = new Date(String(createdAt)).getTime();
  }

  return {
    id: String(dbExpense.id),
    userId: String(dbExpense.user_id),
    name: String(dbExpense.name),
    amount: Number(dbExpense.amount),
    icon: String(dbExpense.icon),
    date: String(dbExpense.date),
    isMonthly: Boolean(dbExpense.is_monthly),
    month: Number(dbExpense.month),
    year: Number(dbExpense.year),
    createdAt: createdAtTime,
  };
}

// Runtime → DB mapping (camelCase → snake_case)
function mapExpenseToDB(expense: Expense): Record<string, unknown> {
  return {
    id: expense.id,
    user_id: expense.userId,
    name: expense.name,
    amount: expense.amount,
    icon: expense.icon,
    date: expense.date,
    is_monthly: expense.isMonthly,
    month: expense.month,
    year: expense.year,
    created_at: expense.createdAt,
  };
}

function mapMappingFromDB(dbMapping: Record<string, unknown>): NameMapping {
  return {
    id: String(dbMapping.id),
    userId: String(dbMapping.user_id),
    customName: String(dbMapping.custom_name),
    iconKey: String(dbMapping.icon_key),
    createdAt: Number(dbMapping.created_at),
  };
}

function mapMappingToDB(mapping: NameMapping): Record<string, unknown> {
  return {
    id: mapping.id,
    user_id: mapping.userId,
    custom_name: mapping.customName,
    icon_key: mapping.iconKey,
    created_at: mapping.createdAt,
  };
}
