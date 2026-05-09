"use client";

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";

export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

type ThemeContextValue = {
  theme: Theme;
  preference: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
};

const THEME_KEY = "elv-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme: Theme = "light";
  const preference: ThemePreference = "light";

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.dataset.theme = "light";
    document.documentElement.dataset.themePreference = "light";
    document.documentElement.style.colorScheme = "light";
    localStorage.removeItem(THEME_KEY);
  }, []);

  const setTheme = useCallback((_nextTheme: ThemePreference) => {
    document.documentElement.classList.remove("dark");
    document.documentElement.dataset.theme = "light";
    document.documentElement.dataset.themePreference = "light";
    document.documentElement.style.colorScheme = "light";
    localStorage.removeItem(THEME_KEY);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme("light");
  }, [setTheme]);

  const value = useMemo(
    () => ({
      theme,
      preference,
      setTheme,
      toggleTheme,
    }),
    [setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
