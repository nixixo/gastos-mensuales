"use client";

import { useState, useEffect, useCallback } from "react";
import { LuX } from "react-icons/lu";
import { detectIcon, ICON_MAP } from "@/lib/icon-map";
import { getUserNameMappings } from "@/lib/db";
import { NameMapping } from "@/lib/types";
import IconPicker from "./IconPicker";

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, amount: number, icon: string, date: string, isMonthly: boolean) => void;
  userId: string;
}

export default function AddExpenseModal({
  open,
  onClose,
  onAdd,
  userId,
}: AddExpenseModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [icon, setIcon] = useState("other");
  const [manualIcon, setManualIcon] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isMonthly, setIsMonthly] = useState(false);
  const [nameMappings, setNameMappings] = useState<NameMapping[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load name mappings when modal opens
  useEffect(() => {
    if (open && userId) {
      getUserNameMappings(userId).then(mappings => {
        setNameMappings(mappings);
      }).catch(err => {
        console.error("Failed to load name mappings:", err);
      });
    }
  }, [open, userId]);

  // Get suggestions based on typed text
  const getSuggestions = useCallback(() => {
    if (!name.trim()) return [];
    
    const lowerName = name.toLowerCase();
    const suggestions: Array<{ type: 'mapping' | 'icon'; key: string; display: string; icon: string }> = [];

    // Check custom name mappings
    nameMappings.forEach(mapping => {
      if (mapping.customName.toLowerCase().includes(lowerName)) {
        suggestions.push({
          type: 'mapping',
          key: mapping.customName,
          display: `${mapping.customName} → ${ICON_MAP[mapping.iconKey]?.label || mapping.iconKey}`,
          icon: mapping.iconKey,
        });
      }
    });

    // Check icon map entries
    Object.entries(ICON_MAP).forEach(([key, entry]) => {
      if (entry.label && entry.label.toLowerCase().includes(lowerName)) {
        suggestions.push({
          type: 'icon',
          key: key,
          display: entry.label,
          icon: key,
        });
      }
    });

    return suggestions;
  }, [name, nameMappings]);

  const handleSelectSuggestion = useCallback((suggestion: ReturnType<typeof getSuggestions>[0]) => {
    setName(suggestion.display.split(' → ')[0]); // Use mapping name or icon label
    setIcon(suggestion.icon);
    setManualIcon(true);
    setShowSuggestions(false);
  }, []);

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
    setShowSuggestions(true);
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
    if (!trimmed || !parsed || parsed <= 0 || !date) return;

    onAdd(trimmed, parsed, icon, date, isMonthly);
    setName("");
    setAmount("");
    setIcon("other");
    setManualIcon(false);
    setDate(new Date().toISOString().split('T')[0]);
    setIsMonthly(false);
    setShowSuggestions(false);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  if (!open) return null;

  const selectedEntry = ICON_MAP[icon];
  const SelectedIcon = selectedEntry?.icon;
  const suggestions = getSuggestions();
  const showSuggestionsDropdown = showSuggestions && suggestions.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-neutral-950 border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-5 animate-slide-up max-h-[90vh] overflow-y-auto">
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
        <div className="flex flex-col gap-1.5 relative">
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
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              placeholder="Ej: Spotify, Supermercado..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/20"
              autoFocus
            />
          </div>
          
          {/* Suggestions dropdown */}
          {showSuggestionsDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden shadow-lg max-h-56 overflow-y-auto">
              {suggestions.slice(0, 5).map((suggestion, idx) => (
                <button
                  key={`${suggestion.type}-${suggestion.key}-${idx}`}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2 border-b border-white/5 last:border-b-0"
                >
                  {ICON_MAP[suggestion.icon]?.icon && 
                    (() => {
                      const Icon = ICON_MAP[suggestion.icon].icon;
                      return (
                        <Icon
                          size={16}
                          style={
                            ICON_MAP[suggestion.icon].color && 
                            ICON_MAP[suggestion.icon].category === "brand"
                              ? { color: ICON_MAP[suggestion.icon].color }
                              : undefined
                          }
                        />
                      );
                    })()
                  }
                  <span>{suggestion.display}</span>
                  {suggestion.type === 'mapping' && (
                    <span className="ml-auto text-xs text-white/40">personalizado</span>
                  )}
                </button>
              ))}
            </div>
          )}
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

        {/* Date input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/40 uppercase tracking-wider">
            Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/5 focus:border-white/20 transition-colors outline-none text-white text-sm"
          />
        </div>

        {/* Is Monthly checkbox */}
        <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/5">
          <input
            type="checkbox"
            id="monthly"
            checked={isMonthly}
            onChange={(e) => setIsMonthly(e.target.checked)}
            className="w-4 h-4 rounded cursor-pointer accent-white"
          />
          <label htmlFor="monthly" className="flex-1 text-sm text-white/80 cursor-pointer">
            ¿Es un gasto mensual recurrente?
          </label>
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
          disabled={!name.trim() || !amount || parseInt(amount, 10) <= 0 || !date}
          className="w-full py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}
