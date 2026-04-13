"use client";

import { useLayoutEffect } from "react";
import { applyTheme, DEFAULT_THEME, THEMES, ThemeName } from "@/lib/themes";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    // Load theme from localStorage on mount
    try {
      const stored = localStorage.getItem("gastos-theme");
      const savedTheme: ThemeName =
        stored && stored in THEMES ? (stored as ThemeName) : DEFAULT_THEME;
      applyTheme(savedTheme);
    } catch (error) {
      console.error("Failed to apply theme:", error);
      applyTheme(DEFAULT_THEME);
    }
  }, []);

  return children;
}
