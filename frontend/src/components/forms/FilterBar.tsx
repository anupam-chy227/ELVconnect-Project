"use client";

import { cn } from "@/components/ui/utils";

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterDefinition = {
  id: string;
  label: string;
  options: FilterOption[];
};

export type FilterBarProps = {
  filters: FilterDefinition[];
  values: Record<string, string>;
  onChange: (filterId: string, value: string) => void;
  className?: string;
};

export function FilterBar({ filters, values, onChange, className }: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-end gap-3 rounded-lg border border-border-subtle bg-surface p-3 dark:border-elv-dark-border dark:bg-elv-dark-2", className)}>
      {filters.map((filter) => (
        <label key={filter.id} className="grid min-w-40 gap-1 text-xs font-black uppercase text-muted-foreground">
          {filter.label}
          <select
            value={values[filter.id] ?? ""}
            onChange={(event) => onChange(filter.id, event.target.value)}
            className="h-10 rounded-md border border-border-subtle bg-white px-3 text-sm font-bold normal-case text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring dark:border-elv-dark-border dark:bg-elv-dark-1 dark:text-white"
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}
