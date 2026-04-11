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
}

export default function ExpenseItem({
  expense,
  onDelete,
  onUpdateAmount,
}: ExpenseItemProps) {
  const entry = ICON_MAP[expense.icon] ?? ICON_MAP["other"];
  const Icon = entry.icon;
  const brandColor = entry.category === "brand" ? entry.color : undefined;

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleStartEdit = () => {
    setEditValue(String(expense.amount));
    setEditing(true);
  };

  const handleConfirm = () => {
    const parsed = parseInt(editValue, 10);
    if (parsed && parsed > 0 && parsed !== expense.amount) {
      onUpdateAmount(expense.id, parsed);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") setEditing(false);
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
        <p className="text-sm font-medium truncate">{expense.name}</p>
        <p className="text-xs text-tertiary">
          {formatDateString(expense.date)}
          {expense.isMonthly && ' • Mensual'}
        </p>
      </div>

      {editing ? (
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
          onClick={handleStartEdit}
          className="text-sm font-medium tabular-nums cursor-pointer hover:text-white/70 transition-colors"
          title="Click para editar"
        >
          {formatCLP(expense.amount)}
        </span>
      )}

      <button
        onClick={() => onDelete(expense.id)}
        className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-opacity"
      >
        <LuX size={14} className="text-white/40" />
      </button>
    </div>
  );
}
