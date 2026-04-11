"use client";

import { useState, useEffect, useCallback } from "react";
import { ThemeName, applyTheme, DEFAULT_THEME } from "@/lib/themes";

interface UseThemeReturn {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  isLoading: boolean;
}

const THEME_STORAGE_KEY = "gastos-theme";

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      const savedTheme = (stored as ThemeName) || DEFAULT_THEME;
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } catch (error) {
      console.error("Failed to load theme:", error);
      applyTheme(DEFAULT_THEME);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setTheme = useCallback((newTheme: ThemeName) => {
    try {
      setThemeState(newTheme);
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      applyTheme(newTheme);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  }, []);

  return { theme, setTheme, isLoading };
}
