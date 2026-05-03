"use client";

import type { InputHTMLAttributes } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/components/ui/utils";

export type SearchBarProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
  onClear?: () => void;
};

export function SearchBar({
  value,
  onValueChange,
  onClear,
  className,
  placeholder = "Search",
  ...props
}: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-border-subtle bg-surface pl-10 pr-10 text-sm font-bold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary-ring dark:border-elv-dark-border dark:bg-elv-dark-2 dark:text-white"
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onValueChange("");
            onClear?.();
          }}
          className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition hover:bg-surface-muted hover:text-foreground dark:hover:bg-elv-dark-3 dark:hover:text-white"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
