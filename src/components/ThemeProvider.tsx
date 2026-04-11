"use client";

import { useEffect } from "react";
import { applyTheme, DEFAULT_THEME } from "@/lib/themes";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load theme from localStorage on mount
    try {
      const stored = localStorage.getItem("gastos-theme");
      const savedTheme = stored || DEFAULT_THEME;
      applyTheme(savedTheme as any);
    } catch (error) {
      console.error("Failed to apply theme:", error);
      applyTheme(DEFAULT_THEME);
    }
  }, []);

  return children;
}
