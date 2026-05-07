"use client";

import { useEffect, useRef, useState } from "react";
import { LuWallet, LuCheck, LuTrash2 } from "react-icons/lu";
import { formatCLP } from "@/lib/utils";

interface BudgetSelectorProps {
  budget: number | null;
  onChange: (amount: number | null) => void;
}

export default function BudgetSelector({ budget, onChange }: BudgetSelectorProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(budget ? String(budget) : "");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(budget ? String(budget) : "");
  }, [budget]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [open]);

  const handleSave = () => {
    const parsed = parseInt(value, 10);

    if (!parsed || parsed <= 0) {
      onChange(null);
      setValue("");
      setOpen(false);
      return;
    }

    onChange(parsed);
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setValue("");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((current) => !current)}
        title="Definir presupuesto"
        className="p-2 rounded-lg hover:bg-ui-hover transition-colors text-primary"
      >
        <LuWallet size={20} />
      </button>

      {open && (
        <div className="fixed left-4 right-4 top-20 z-50 rounded-2xl border border-ui bg-secondary p-3 shadow-xl backdrop-blur-md sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-64">
          <p className="text-sm font-medium text-primary">Presupuesto del mes</p>
          <p className="mt-1 text-xs text-tertiary">
            {budget ? `Actual: ${formatCLP(budget)}` : "Aun no has definido un monto"}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-tertiary">$</span>
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setOpen(false);
              }}
              className="flex-1 bg-ui-input border border-ui rounded-lg px-3 py-2 text-sm outline-none focus:border-ui [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="Ej: 350000"
            />
            <button
              onClick={handleSave}
              className="p-2 rounded-lg hover:bg-ui-hover transition-colors"
              title="Guardar"
            >
              <LuCheck size={16} />
            </button>
          </div>

          <button
            onClick={handleClear}
            className="mt-3 flex items-center gap-2 text-xs text-tertiary hover:text-primary transition-colors"
            type="button"
          >
            <LuTrash2 size={14} />
            Quitar presupuesto
          </button>
        </div>
      )}
    </div>
  );
}
