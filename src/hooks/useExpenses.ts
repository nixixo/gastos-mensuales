"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Expense } from "@/lib/types";
import {
  getExpensesByMonth,
  addExpense as dbAdd,
  deleteExpense as dbDelete,
  updateExpense as dbUpdate,
} from "@/lib/db";
import { handleMonthlyRecurring } from "@/lib/recurring";

export function useExpenses(userId: string, month: number, year: number) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const expensesRef = useRef<Expense[]>([]);
  
  // Track if we've already processed recurring expenses for this month
  // to avoid duplicate copies
  const recurringProcessedRef = useRef<string>(`${userId}-${year}-${month}`);

  const load = useCallback(async () => {
    // Don't load if userId is empty - use cached expenses from ref
    if (!userId) {
      setExpenses(expensesRef.current);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Check if we need to process recurring expenses for this month
    const currentKey = `${userId}-${year}-${month}`;
    if (recurringProcessedRef.current !== currentKey) {
      recurringProcessedRef.current = currentKey;
      
      // Handle recurring expenses (copy monthly ones from previous month)
      await handleMonthlyRecurring(userId, month, year);
    }
    
    // Load expenses for current month (now includes any newly added recurring ones)
    const data = await getExpensesByMonth(userId, year, month);
    expensesRef.current = data;
    setExpenses(data);
    setIsLoading(false);
  }, [userId, month, year]);

  useEffect(() => {
    load();
  }, [load]);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const addExpense = useCallback(
    async (name: string, amount: number, icon: string, date: string, isMonthly: boolean = false) => {
      const expense: Expense = {
        id: crypto.randomUUID(),
        userId,
        name,
        amount,
        icon,
        date,
        isMonthly,
        month,
        year,
        createdAt: Date.now(),
      };
      await dbAdd(expense);
      const updated = [expense, ...expensesRef.current];
      expensesRef.current = updated;
      setExpenses(updated);
    },
    [userId, month, year]
  );

  const deleteExpense = useCallback(async (id: string) => {
    await dbDelete(id);
    const updated = expensesRef.current.filter((e) => e.id !== id);
    expensesRef.current = updated;
    setExpenses(updated);
  }, []);

  const updateAmount = useCallback(async (id: string, amount: number) => {
    await dbUpdate(id, { amount } as Expense);
    const updated = expensesRef.current.map((e) => (e.id === id ? { ...e, amount } : e));
    expensesRef.current = updated;
    setExpenses(updated);
  }, []);

  return { expenses, total, isLoading, addExpense, deleteExpense, updateAmount };
}
