"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Command, Search, X } from "lucide-react";
import { cn } from "@/components/ui/utils";

export type CommandPaletteItem = {
  id: string;
  label: string;
  type: "page" | "job" | "engineer" | "action";
  description?: string;
  href?: string;
  icon?: ReactNode;
  action?: () => void;
};

export type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandPaletteItem[];
  recentItems?: CommandPaletteItem[];
  title?: string;
};

function matchesItem(item: CommandPaletteItem, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return [item.label, item.description, item.type].filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery);
}

export function CommandPalette({
  open,
  onOpenChange,
  items,
  recentItems = [],
  title = "Command palette",
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const visibleItems = useMemo(() => {
    const source = query.trim() ? items : recentItems.length ? recentItems : items;
    return source.filter((item) => matchesItem(item, query)).slice(0, 8);
  }, [items, query, recentItems]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
      if (!open) return;
      if (event.key === "Escape") onOpenChange(false);
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((current) => Math.min(current + 1, Math.max(visibleItems.length - 1, 0)));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
      }
      if (event.key === "Enter") {
        const item = visibleItems[activeIndex];
        if (!item) return;
        if (item.href) router.push(item.href);
        item.action?.();
        onOpenChange(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, onOpenChange, open, router, visibleItems]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] bg-slate-950/45 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onOpenChange(false);
          }}
        >
          <motion.div
            className="mx-auto mt-[10vh] max-w-2xl overflow-hidden rounded-lg border border-white/40 bg-white/92 shadow-2xl backdrop-blur-2xl dark:border-elv-dark-border dark:bg-elv-dark-2/95"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.16 }}
          >
            <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3 dark:border-elv-dark-border">
              <Command className="h-5 w-5 text-primary" aria-hidden="true" />
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                  }}
                  placeholder="Search pages, jobs, engineers, actions"
                  className="h-10 w-full bg-transparent pl-6 text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-md p-2 text-muted-foreground transition hover:bg-surface-muted hover:text-foreground dark:hover:bg-elv-dark-3 dark:hover:text-white"
                aria-label="Close command palette"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto p-2">
              {visibleItems.length ? (
                visibleItems.map((item, index) => {
                  const active = index === activeIndex;
                  const content = (
                    <>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary-subtle text-primary dark:bg-elv-dark-3 dark:text-indigo-200">
                        {item.icon ?? <Command className="h-4 w-4" aria-hidden="true" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black">{item.label}</span>
                        {item.description ? <span className="block truncate text-xs text-muted-foreground dark:text-white/55">{item.description}</span> : null}
                      </span>
                      <span className="rounded-full border border-border-subtle px-2 py-0.5 text-[10px] font-black uppercase text-muted-foreground dark:border-elv-dark-border dark:text-white/45">
                        {item.type}
                      </span>
                    </>
                  );

                  const className = cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-foreground transition dark:text-white",
                    active && "bg-primary text-on-primary dark:bg-elv-iris dark:text-white",
                    !active && "hover:bg-primary-subtle dark:hover:bg-elv-dark-3",
                  );

                  return item.href ? (
                    <Link key={item.id} href={item.href} className={className} onClick={() => onOpenChange(false)}>
                      {content}
                    </Link>
                  ) : (
                    <button
                      key={item.id}
                      type="button"
                      className={className}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => {
                        item.action?.();
                        onOpenChange(false);
                      }}
                    >
                      {content}
                    </button>
                  );
                })
              ) : (
                <p className="px-4 py-10 text-center text-sm font-bold text-muted-foreground">No matching commands</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
