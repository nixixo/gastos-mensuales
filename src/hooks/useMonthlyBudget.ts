"use client";

import { useEffect, useState } from "react";
import { deleteMonthlyBudget, getMonthlyBudget, upsertMonthlyBudget } from "@/lib/db";
import type { MonthlyBudget } from "@/lib/types";

interface UseMonthlyBudgetReturn {
  budget: number | null;
  setBudget: (amount: number | null) => void;
}

export function useMonthlyBudget(
  userId: string,
  month: number,
  year: number
): UseMonthlyBudgetReturn {
  const [budget, setBudgetState] = useState<number | null>(null);
  const [budgetId, setBudgetId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!userId) {
      setBudgetState(null);
      setBudgetId(null);
      return;
    }

    async function loadBudget() {
      try {
        const storedBudget = await getMonthlyBudget(userId, year, month);
        if (active) {
          setBudgetState(storedBudget?.amount ?? null);
          setBudgetId(storedBudget?.id ?? null);
        }
      } catch (error) {
        console.error("Failed to load monthly budget:", error);
        if (active) {
          setBudgetState(null);
          setBudgetId(null);
        }
      }
    }

    loadBudget();

    return () => {
      active = false;
    };
  }, [userId, year, month]);

  const setBudget = (amount: number | null) => {
    setBudgetState(amount);

    if (!userId) return;

    void (async () => {
      try {
        if (amount === null) {
          await deleteMonthlyBudget(userId, year, month);
          setBudgetId(null);
          return;
        }

        const nextId = budgetId ?? crypto.randomUUID();
        const nextBudget: MonthlyBudget = {
          id: nextId,
          userId,
          month,
          year,
          amount,
          createdAt: Date.now(),
        };

        await upsertMonthlyBudget(nextBudget);
        setBudgetId(nextId);
      } catch (error) {
        console.error("Failed to save monthly budget:", error);
      }
    })();
  };

  return { budget, setBudget };
}
