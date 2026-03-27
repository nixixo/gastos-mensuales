"use client";

import { useState, useEffect, useCallback } from "react";
import { LuX } from "react-icons/lu";
import { detectIcon, ICON_MAP } from "@/lib/icon-map";
import IconPicker from "./IconPicker";

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, amount: number, icon: string) => void;
}

export default function AddExpenseModal({
  open,
  onClose,
  onAdd,
}: AddExpenseModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [icon, setIcon] = useState("other");
  const [manualIcon, setManualIcon] = useState(false);


  const handleIconSelect = useCallback((key: string) => {
    if (key === icon && manualIcon) {
      // Deselect: go back to auto-detect mode
      setManualIcon(false);
      const detected = detectIcon(name);
      setIcon(detected ?? "other");
    } else {
      setIcon(key);
      setManualIcon(true);
    }
  }, [icon, manualIcon, name]);

  const handleNameChange = useCallback((value: string) => {
    setName(value);
    // Only auto-detect if user hasn't manually picked an icon
    if (!manualIcon) {
      const detected = detectIcon(value);
      if (detected) {
        setIcon(detected);
      } else {
        setIcon("other");
      }
    }
  }, [manualIcon]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    const parsed = parseInt(amount, 10);
    if (!trimmed || !parsed || parsed <= 0) return;

    onAdd(trimmed, parsed, icon);
    setName("");
    setAmount("");
    setIcon("other");
    setManualIcon(false);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  if (!open) return null;

  const selectedEntry = ICON_MAP[icon];
  const SelectedIcon = selectedEntry?.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-neutral-950 border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-5 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Agregar gasto</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <LuX size={18} />
          </button>
        </div>

        {/* Name input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/40 uppercase tracking-wider">
            Nombre
          </label>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/5 focus-within:border-white/20 transition-colors">
            {SelectedIcon && (
              <SelectedIcon
                size={18}
                className="shrink-0 text-white/40"
                style={
                  selectedEntry.color && selectedEntry.category === "brand"
                    ? { color: selectedEntry.color }
                    : undefined
                }
              />
            )}
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ej: Spotify, Supermercado..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/20"
              autoFocus
            />
          </div>
        </div>

        {/* Amount input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/40 uppercase tracking-wider">
            Monto (CLP)
          </label>
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3 border border-white/5 focus-within:border-white/20 transition-colors">
            <span className="text-white/40 text-sm">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
              min="1"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Icon picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/40 uppercase tracking-wider">
            Icono
          </label>
          <IconPicker selected={icon} onSelect={handleIconSelect} />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !amount || parseInt(amount, 10) <= 0}
          className="w-full py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}
