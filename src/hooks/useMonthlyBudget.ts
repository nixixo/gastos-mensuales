"use client";

import { useEffect, useMemo, useState } from "react";

interface UseMonthlyBudgetReturn {
  budget: number | null;
  setBudget: (amount: number | null) => void;
}

const STORAGE_PREFIX = "gastos-budget";

export function useMonthlyBudget(
  userId: string,
  month: number,
  year: number
): UseMonthlyBudgetReturn {
  const storageKey = useMemo(
    () => `${STORAGE_PREFIX}:${userId}:${year}-${month}`,
    [userId, year, month]
  );
  const [budget, setBudgetState] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) {
      setBudgetState(null);
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      setBudgetState(stored ? Number(stored) : null);
    } catch (error) {
      console.error("Failed to load monthly budget:", error);
      setBudgetState(null);
    }
  }, [storageKey, userId]);

  const setBudget = (amount: number | null) => {
    setBudgetState(amount);

    if (!userId) return;

    try {
      if (amount === null) {
        localStorage.removeItem(storageKey);
        return;
      }

      localStorage.setItem(storageKey, String(amount));
    } catch (error) {
      console.error("Failed to save monthly budget:", error);
    }
  };

  return { budget, setBudget };
}
