import { openDB, type IDBPDatabase } from "idb";
import type { Expense, MonthlyBudget, NameMapping, ShoppingItem } from "./types";
import { supabase } from "./supabase";

const DB_NAME = "expense-tracker";
const DB_VERSION = 4;
const STORE_EXPENSES = "expenses";
const STORE_MAPPINGS = "name_mappings";
const STORE_SHOPPING = "shopping_items";
const STORE_BUDGETS = "monthly_budgets";

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

        // Shopping items store
        if (!db.objectStoreNames.contains(STORE_SHOPPING)) {
          const shoppingStore = db.createObjectStore(STORE_SHOPPING, { keyPath: "id" });
          shoppingStore.createIndex("by-user", "userId");
        }

        // Monthly budgets store
        if (!db.objectStoreNames.contains(STORE_BUDGETS)) {
          const budgetStore = db.createObjectStore(STORE_BUDGETS, { keyPath: "id" });
          budgetStore.createIndex("by-period", ["userId", "year", "month"]);
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

// ========== SHOPPING ITEMS ==========

export async function getShoppingItems(userId: string): Promise<ShoppingItem[]> {
  const db = await getDB();
  const localItems = await db.getAllFromIndex(STORE_SHOPPING, "by-user", userId);

  try {
    if (localItems.length > 0) {
      await supabase.from("shopping_items").upsert(
        localItems.map(mapShoppingItemToDB),
        { onConflict: "id" }
      );
    }

    const { data, error } = await supabase
      .from("shopping_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const tx = db.transaction(STORE_SHOPPING, "readwrite");
      for (const item of data) {
        await tx.store.put(mapShoppingItemFromDB(item));
      }
      await tx.done;

      return data.map(mapShoppingItemFromDB);
    }
  } catch (e) {
    console.warn("Supabase shopping items sync failed, falling back to IndexedDB:", e);
  }

  return localItems.sort((a, b) => b.createdAt - a.createdAt);
}

export async function addShoppingItem(item: ShoppingItem): Promise<void> {
  try {
    await supabase.from("shopping_items").insert([mapShoppingItemToDB(item)]);
  } catch (e) {
    console.warn("Supabase shopping item insert failed, saving to IndexedDB only:", e);
  }

  const db = await getDB();
  await db.add(STORE_SHOPPING, item);
}

export async function deleteShoppingItem(id: string): Promise<void> {
  try {
    await supabase.from("shopping_items").delete().eq("id", id);
  } catch (e) {
    console.warn("Supabase shopping item delete failed:", e);
  }

  const db = await getDB();
  await db.delete(STORE_SHOPPING, id);
}

// ========== MONTHLY BUDGETS ==========

export async function getMonthlyBudget(
  userId: string,
  year: number,
  month: number
): Promise<MonthlyBudget | null> {
  try {
    const { data, error } = await supabase
      .from("monthly_budgets")
      .select("*")
      .eq("user_id", userId)
      .eq("year", year)
      .eq("month", month)
      .maybeSingle();

    if (!error) {
      if (!data) {
        const db = await getDB();
        const localBudget = await db.getFromIndex(STORE_BUDGETS, "by-period", [userId, year, month]);
        if (localBudget) {
          await db.delete(STORE_BUDGETS, localBudget.id);
        }
        return null;
      }

      const budget = mapBudgetFromDB(data);
      const db = await getDB();
      await db.put(STORE_BUDGETS, budget);
      return budget;
    }
  } catch (e) {
    console.warn("Supabase monthly budget fetch failed, falling back to IndexedDB:", e);
  }

  const db = await getDB();
  return (await db.getFromIndex(STORE_BUDGETS, "by-period", [userId, year, month])) ?? null;
}

export async function upsertMonthlyBudget(budget: MonthlyBudget): Promise<void> {
  try {
    await supabase.from("monthly_budgets").upsert([mapBudgetToDB(budget)], {
      onConflict: "user_id,year,month",
    });
  } catch (e) {
    console.warn("Supabase monthly budget upsert failed, saving to IndexedDB only:", e);
  }

  const db = await getDB();
  await db.put(STORE_BUDGETS, budget);
}

export async function deleteMonthlyBudget(
  userId: string,
  year: number,
  month: number
): Promise<void> {
  try {
    await supabase
      .from("monthly_budgets")
      .delete()
      .eq("user_id", userId)
      .eq("year", year)
      .eq("month", month);
  } catch (e) {
    console.warn("Supabase monthly budget delete failed:", e);
  }

  const db = await getDB();
  const localBudget = await db.getFromIndex(STORE_BUDGETS, "by-period", [userId, year, month]);
  if (localBudget) {
    await db.delete(STORE_BUDGETS, localBudget.id);
  }
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

function mapShoppingItemFromDB(dbItem: Record<string, unknown>): ShoppingItem {
  const createdAt = dbItem.created_at;
  let createdAtTime: number;

  if (typeof createdAt === "number") {
    createdAtTime = createdAt;
  } else {
    createdAtTime = new Date(String(createdAt)).getTime();
  }

  return {
    id: String(dbItem.id),
    userId: String(dbItem.user_id),
    name: String(dbItem.name),
    amount: Number(dbItem.amount),
    icon: String(dbItem.icon),
    date: String(dbItem.date),
    createdAt: createdAtTime,
  };
}

function mapShoppingItemToDB(item: ShoppingItem): Record<string, unknown> {
  return {
    id: item.id,
    user_id: item.userId,
    name: item.name,
    amount: item.amount,
    icon: item.icon,
    date: item.date,
    created_at: item.createdAt,
  };
}

function mapBudgetFromDB(dbBudget: Record<string, unknown>): MonthlyBudget {
  const createdAt = dbBudget.created_at;
  let createdAtTime: number;

  if (typeof createdAt === "number") {
    createdAtTime = createdAt;
  } else {
    createdAtTime = new Date(String(createdAt)).getTime();
  }

  return {
    id: String(dbBudget.id),
    userId: String(dbBudget.user_id),
    month: Number(dbBudget.month),
    year: Number(dbBudget.year),
    amount: Number(dbBudget.amount),
    createdAt: createdAtTime,
  };
}

function mapBudgetToDB(budget: MonthlyBudget): Record<string, unknown> {
  return {
    id: budget.id,
    user_id: budget.userId,
    month: budget.month,
    year: budget.year,
    amount: budget.amount,
    created_at: budget.createdAt,
  };
}
