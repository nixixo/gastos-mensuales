"use client";

import type { Expense } from "@/lib/types";
import ExpenseItem from "./ExpenseItem";
import EmptyState from "./EmptyState";

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onUpdateAmount: (id: string, amount: number) => void;
  onUpdateName: (id: string, name: string) => void;
  emptyMessage?: string;
}

export default function ExpenseList({
  expenses,
  onDelete,
  onUpdateAmount,
  onUpdateName,
  emptyMessage,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="flex flex-col gap-2">
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onDelete={onDelete}
          onUpdateAmount={onUpdateAmount}
          onUpdateName={onUpdateName}
        />
      ))}
    </div>
  );
}
