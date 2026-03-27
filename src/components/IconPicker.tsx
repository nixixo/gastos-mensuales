"use client";

import { BRAND_ICONS, GENERAL_ICONS, type IconEntry } from "@/lib/icon-map";

interface IconPickerProps {
  selected: string;
  onSelect: (key: string) => void;
}

function IconGrid({
  icons,
  selected,
  onSelect,
}: {
  icons: [string, IconEntry][];
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {icons.map(([key, entry]) => {
        const Icon = entry.icon;
        const isSelected = selected === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`flex flex-col items-center justify-center gap-1 rounded-lg p-2 transition-colors ${
              isSelected
                ? "bg-white/15 ring-1 ring-white"
                : "hover:bg-white/5"
            }`}
          >
            <Icon
              size={20}
              className={isSelected && entry.color ? "" : "text-white/70"}
              style={isSelected && entry.color ? { color: entry.color } : undefined}
            />
            <span className="text-[10px] text-white/50 leading-tight truncate w-full text-center">
              {entry.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function IconPicker({ selected, onSelect }: IconPickerProps) {
  return (
    <div className="flex flex-col gap-3 max-h-48 overflow-y-auto px-1 -mx-1">
      <div>
        <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Marcas</p>
        <IconGrid icons={BRAND_ICONS} selected={selected} onSelect={onSelect} />
      </div>
      <div>
        <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Categorias</p>
        <IconGrid icons={GENERAL_ICONS} selected={selected} onSelect={onSelect} />
      </div>
    </div>
  );
}
