"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "./utils";

export type DrawerProps = {
  open: boolean;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: "left" | "right";
  onClose: () => void;
};

export function Drawer({ open, title, description, children, footer, side = "right", onClose }: DrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/55">
      <aside
        className={cn(
          "fixed top-0 h-full w-full max-w-md border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-700">
          <div>
            {title ? <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">{title}</h2> : null}
            {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Close drawer">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="h-[calc(100%-8rem)] overflow-y-auto p-4">{children}</div>
        {footer ? <div className="border-t border-slate-200 p-4 dark:border-slate-700">{footer}</div> : null}
      </aside>
    </div>
  );
}
