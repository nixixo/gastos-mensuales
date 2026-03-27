import { openDB, type IDBPDatabase } from "idb";
import type { Expense } from "./types";

const DB_NAME = "expense-tracker";
const DB_VERSION = 1;
const STORE = "expenses";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("by-month", ["year", "month"]);
      },
    });
  }
  return dbPromise;
}

export async function getExpensesByMonth(
  year: number,
  month: number
): Promise<Expense[]> {
  const db = await getDB();
  const expenses = await db.getAllFromIndex(STORE, "by-month", [year, month]);
  return expenses.sort((a, b) => b.createdAt - a.createdAt);
}

export async function addExpense(expense: Expense): Promise<void> {
  const db = await getDB();
  await db.add(STORE, expense);
}

export async function deleteExpense(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE, id);
}

export async function updateExpenseAmount(
  id: string,
  amount: number
): Promise<void> {
  const db = await getDB();
  const expense = await db.get(STORE, id);
  if (expense) {
    expense.amount = amount;
    await db.put(STORE, expense);
  }
}

export interface MonthSummary {
  month: number;
  year: number;
  total: number;
  count: number;
}

export async function getPastMonths(
  currentMonth: number,
  currentYear: number
): Promise<MonthSummary[]> {
  const db = await getDB();
  const all: Expense[] = await db.getAll(STORE);

  const grouped: Record<string, MonthSummary> = {};

  for (const expense of all) {
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
