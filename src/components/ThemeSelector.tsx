"use client";

import { useState, useRef, useEffect } from "react";
import { LuPalette, LuCheck } from "react-icons/lu";
import { THEMES, type ThemeName } from "@/lib/themes";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  const themeEntries = Object.entries(THEMES) as Array<[ThemeName, typeof THEMES[ThemeName]]>;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        title="Cambiar tema"
        className="p-2 rounded-lg hover:bg-ui-hover transition-colors text-secondary hover:text-primary"
      >
        <LuPalette size={20} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-secondary backdrop-blur-md border border-ui rounded-2xl shadow-xl py-2 z-50">
          {themeEntries.map(([themeName, themeData]) => (
            <button
              key={themeName}
              onClick={() => {
                setTheme(themeName);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left ${
                theme === themeName
                  ? "bg-ui-hover text-primary"
                  : "text-secondary hover:text-primary hover:bg-ui-hover"
              }`}
            >
              {/* Theme color preview */}
              <div className="flex gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: themeData.bg.primary }}
                  title="Fondo"
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: themeData.text.primary }}
                  title="Texto"
                />
              </div>

              <span className="text-sm flex-1">{themeData.label}</span>

              {theme === themeName && (
                <LuCheck size={16} className="text-tertiary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
