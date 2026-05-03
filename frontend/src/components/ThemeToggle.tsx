"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border-subtle bg-surface-raised text-muted-foreground shadow-sm backdrop-blur-xl transition-all hover:border-primary/35 hover:bg-primary-subtle hover:text-primary dark:border-elv-dark-border dark:bg-elv-dark-2 dark:text-white/70 dark:hover:text-white"
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
