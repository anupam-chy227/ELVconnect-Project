"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "./utils";

export type DropdownItem = {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onSelect?: () => void;
};

export type DropdownProps = {
  label: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
  menuClassName?: string;
};

export function Dropdown({ label, items, align = "right", className, menuClassName }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const itemClassName = (item: DropdownItem) =>
    cn(
      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-bold transition",
      item.danger
        ? "text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30"
        : "text-foreground hover:bg-primary-subtle hover:text-primary dark:text-white/80 dark:hover:bg-elv-dark-3 dark:hover:text-white",
      item.disabled && "pointer-events-none opacity-45",
    );

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm font-black text-foreground shadow-sm transition hover:border-primary/30 hover:bg-primary-subtle dark:border-elv-dark-border dark:bg-elv-dark-2 dark:text-white"
      >
        {label}
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute top-full z-50 mt-2 min-w-48 overflow-hidden rounded-md border border-border-subtle bg-white py-1 shadow-xl dark:border-elv-dark-border dark:bg-elv-dark-2",
            align === "right" ? "right-0" : "left-0",
            menuClassName,
          )}
        >
          {items.map((item) =>
            item.href ? (
              <Link
                key={item.id}
                href={item.href}
                role="menuitem"
                aria-disabled={item.disabled}
                className={itemClassName(item)}
                onClick={() => {
                  item.onSelect?.();
                  setOpen(false);
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            ) : (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={itemClassName(item)}
                onClick={() => {
                  item.onSelect?.();
                  setOpen(false);
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
