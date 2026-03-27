"use client";

import { useState, useEffect, useCallback } from "react";
import type { Expense } from "@/lib/types";
import {
  getExpensesByMonth,
  addExpense as dbAdd,
  deleteExpense as dbDelete,
  updateExpenseAmount as dbUpdateAmount,
} from "@/lib/db";

export function useExpenses(month: number, year: number) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await getExpensesByMonth(year, month);
    setExpenses(data);
    setIsLoading(false);
  }, [month, year]);

  useEffect(() => {
    load();
  }, [load]);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const addExpense = useCallback(
    async (name: string, amount: number, icon: string) => {
      const expense: Expense = {
        id: crypto.randomUUID(),
        name,
        amount,
        icon,
        month,
        year,
        createdAt: Date.now(),
      };
      await dbAdd(expense);
      setExpenses((prev) => [expense, ...prev]);
    },
    [month, year]
  );

  const deleteExpense = useCallback(async (id: string) => {
    await dbDelete(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateAmount = useCallback(async (id: string, amount: number) => {
    await dbUpdateAmount(id, amount);
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, amount } : e))
    );
  }, []);

  return { expenses, total, isLoading, addExpense, deleteExpense, updateAmount };
}
