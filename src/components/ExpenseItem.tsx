"use client";

import { useState, useRef, useEffect } from "react";
import { LuX, LuCheck } from "react-icons/lu";
import { ICON_MAP } from "@/lib/icon-map";
import { formatCLP, formatDateString } from "@/lib/utils";
import type { Expense } from "@/lib/types";

interface ExpenseItemProps {
  expense: Expense;
  onDelete: (id: string) => void;
  onUpdateAmount: (id: string, amount: number) => void;
  onUpdateName: (id: string, name: string) => void;
}

export default function ExpenseItem({
  expense,
  onDelete,
  onUpdateAmount,
  onUpdateName,
}: ExpenseItemProps) {
  const entry = ICON_MAP[expense.icon] ?? ICON_MAP["other"];
  const Icon = entry.icon;
  const brandColor = entry.category === "brand" ? entry.color : undefined;

  const [editingField, setEditingField] = useState<"name" | "amount" | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingField]);

  const handleStartAmountEdit = () => {
    setEditValue(String(expense.amount));
    setEditingField("amount");
  };

  const handleStartNameEdit = () => {
    setEditValue(expense.name);
    setEditingField("name");
  };

  const handleConfirm = () => {
    if (editingField === "amount") {
      const parsed = parseInt(editValue, 10);
      if (parsed && parsed > 0 && parsed !== expense.amount) {
        onUpdateAmount(expense.id, parsed);
      }
    }

    if (editingField === "name") {
      const trimmed = editValue.trim();
      if (trimmed && trimmed !== expense.name) {
        onUpdateName(expense.id, trimmed);
      }
    }

    setEditingField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") setEditingField(null);
  };

  return (
    <div className="flex items-center gap-3 py-3 px-1 group">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ui-input">
        <Icon
          size={18}
          className={brandColor ? "" : "text-secondary"}
          style={brandColor ? { color: brandColor } : undefined}
        />
      </div>

      <div className="flex-1 min-w-0">
        {editingField === "name" ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleConfirm}
            className="w-full bg-ui-input border border-ui rounded-lg px-2 py-1 text-sm font-medium outline-none focus:border-ui"
          />
        ) : (
          <p
            onClick={handleStartNameEdit}
            className="text-sm font-medium truncate cursor-pointer hover:text-white/70 transition-colors"
            title="Click para editar"
          >
            {expense.name}
          </p>
        )}
        <p className="text-xs text-tertiary">
          {formatDateString(expense.date)}
          {expense.isMonthly && ' • Mensual'}
        </p>
      </div>

      {editingField === "amount" ? (
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-tertiary">$</span>
          <input
            ref={inputRef}
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleConfirm}
            className="w-24 bg-ui-input border border-ui rounded-lg px-2 py-1 text-sm outline-none focus:border-ui tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={handleConfirm}
            className="p-1 rounded-full hover:bg-ui-hover transition-colors"
          >
            <LuCheck size={14} className="text-tertiary" />
          </button>
        </div>
      ) : (
        <span
          onClick={handleStartAmountEdit}
          className="text-sm font-medium tabular-nums cursor-pointer hover:text-white/70 transition-colors"
          title="Click para editar"
        >
          {formatCLP(expense.amount)}
        </span>
      )}

      <button
        onClick={() => onDelete(expense.id)}
        className="p-1.5 rounded-full hover:bg-ui-hover transition-colors text-secondary hover:text-primary"      >
        <LuX size={14} />
      </button>
    </div>
  );
}
