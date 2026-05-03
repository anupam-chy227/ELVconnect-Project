"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { toast, type ToastRecord, type ToastType } from "@/lib/toast";

export type Toast = ToastRecord;

interface ToastContextType {
  toasts: ToastRecord[];
  addToast: (message: string, type: ToastType, duration?: number) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

function useToastSnapshot() {
  return useSyncExternalStore(toast.subscribe, toast.getSnapshot, toast.getSnapshot);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const toasts = useToastSnapshot();

  const addToast = useCallback((message: string, type: ToastType, duration?: number) => {
    return toast.show(type, message, { duration });
  }, []);

  const removeToast = useCallback((id: string) => {
    toast.dismiss(id);
  }, []);

  const value = useMemo(
    () => ({ toasts, addToast, removeToast }),
    [addToast, removeToast, toasts],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export { toast, type ToastType };
