"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X, type LucideIcon } from "lucide-react";
import { toast, toastConfig, type ToastRecord, type ToastType } from "@/lib/toast";
import { cn } from "@/components/ui/utils";

type ToastTone = {
  icon: LucideIcon;
  card: string;
  iconWrap: string;
  iconClass: string;
  progress: string;
};

const toastTones: Record<ToastType, ToastTone> = {
  success: {
    icon: CheckCircle2,
    card: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/70 dark:bg-emerald-950/70 dark:text-emerald-50",
    iconWrap: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
    iconClass: "text-emerald-600 dark:text-emerald-200",
    progress: "bg-emerald-500",
  },
  error: {
    icon: AlertCircle,
    card: "border-red-200 bg-red-50 text-red-950 dark:border-red-900/70 dark:bg-red-950/70 dark:text-red-50",
    iconWrap: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200",
    iconClass: "text-red-600 dark:text-red-200",
    progress: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    card: "border-orange-200 bg-orange-50 text-orange-950 dark:border-orange-900/70 dark:bg-orange-950/70 dark:text-orange-50",
    iconWrap: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200",
    iconClass: "text-orange-600 dark:text-orange-200",
    progress: "bg-orange-500",
  },
  info: {
    icon: Info,
    card: "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900/70 dark:bg-blue-950/70 dark:text-blue-50",
    iconWrap: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200",
    iconClass: "text-blue-600 dark:text-blue-200",
    progress: "bg-blue-500",
  },
};

function useToasts() {
  return useSyncExternalStore(toast.subscribe, toast.getSnapshot, toast.getSnapshot);
}

function ToastItem({ item }: { item: ToastRecord }) {
  const tone = toastTones[item.type];
  const Icon = tone.icon;
  const [paused, setPaused] = useState(false);
  const [remaining, setRemaining] = useState(item.duration);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (item.duration <= 0 || paused) return;

    startedAtRef.current = Date.now();
    timerRef.current = window.setTimeout(() => {
      toast.dismiss(item.id);
    }, remaining);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [item.duration, item.id, paused, remaining]);

  const pause = () => {
    if (paused) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (startedAtRef.current) {
      setRemaining((current) => Math.max(current - (Date.now() - startedAtRef.current!), 0));
    }
    setPaused(true);
  };

  const resume = () => {
    if (paused) setPaused(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 36, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 36, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      onMouseEnter={pause}
      onMouseLeave={resume}
      className={cn(
        "pointer-events-auto relative w-full overflow-hidden rounded-lg border p-4 pr-3 shadow-lg backdrop-blur-xl",
        tone.card,
      )}
      role="status"
      aria-live={item.type === "error" ? "assertive" : "polite"}
    >
      <div className="flex items-start gap-3">
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-md", tone.iconWrap)}>
          <Icon className={cn("h-5 w-5", tone.iconClass)} />
        </span>
        <p className="min-w-0 flex-1 pt-1 text-sm font-bold leading-5">{item.message}</p>
        <button
          type="button"
          onClick={() => toast.dismiss(item.id)}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md opacity-65 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {item.duration > 0 ? (
        <motion.div
          className={cn("absolute bottom-0 left-0 h-1", tone.progress)}
          initial={{ width: "100%" }}
          animate={{ width: paused ? undefined : "0%" }}
          transition={{ duration: remaining / 1000, ease: "linear" }}
        />
      ) : null}
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useToasts();
  const visibleToasts = toasts.slice(-toastConfig.maxVisibleToasts).reverse();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
      <AnimatePresence initial={false} mode="popLayout">
        {visibleToasts.map((item) => (
          <ToastItem key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export { toast };
