"use client";

import { useSyncExternalStore } from "react";
import { toast, toastConfig } from "@/lib/toast";

export function useToast() {
  const toasts = useSyncExternalStore(toast.subscribe, toast.getSnapshot, toast.getSnapshot);

  return {
    toast,
    toasts,
    config: toastConfig,
  };
}
