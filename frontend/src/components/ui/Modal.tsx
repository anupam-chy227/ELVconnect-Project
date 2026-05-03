"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./Button";
import { cn } from "./utils";

export type ModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  onClose: () => void;
};

const sizes = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
};

export function Modal({ open, title, description, children, footer, size = "md", onClose }: ModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          onMouseDown={onClose}
        >
          <motion.div
            className={cn(
              "w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900",
              sizes[size],
            )}
            initial={{ opacity: 0, y: 16, scale: 0.97, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, scale: 0.98, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/40">
              <div className="min-w-0">
                {title ? <h2 className="text-base font-semibold tracking-tight text-slate-950 dark:text-slate-50">{title}</h2> : null}
                {description ? <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p> : null}
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">{children}</div>
            {footer ? <div className="border-t border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/40">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
