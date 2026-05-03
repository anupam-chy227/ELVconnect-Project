"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ClipboardList, GripHorizontal, Minus, Signal, UsersRound, X } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { getExternalJson } from "@/lib/api";

type LivePulseStats = {
  engineersOnline: number;
  jobsPostedToday: number;
  completedToday: number;
  citiesActive: number;
};

type LivePulseWidgetProps = {
  statsUrl?: string;
  initialStats?: LivePulseStats;
  storageKey?: string;
  className?: string;
};

type StatItem = {
  key: keyof LivePulseStats;
  label: string;
  emoji: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
};

const defaultStats: LivePulseStats = {
  engineersOnline: 247,
  jobsPostedToday: 56,
  completedToday: 18,
  citiesActive: 12,
};

const statItems: StatItem[] = [
  {
    key: "engineersOnline",
    label: "Engineers online",
    emoji: "🟢",
    icon: UsersRound,
    accent: "from-emerald-300 to-emerald-500",
  },
  {
    key: "jobsPostedToday",
    label: "Jobs posted today",
    emoji: "📋",
    icon: ClipboardList,
    accent: "from-indigo-300 to-elv-iris",
  },
  {
    key: "completedToday",
    label: "Completed today",
    emoji: "✅",
    icon: CheckCircle2,
    accent: "from-sky-300 to-cyan-500",
  },
  {
    key: "citiesActive",
    label: "Cities active",
    emoji: "🏙️",
    icon: Signal,
    accent: "from-violet-300 to-elv-purple",
  },
];

async function fetchStats(url: string): Promise<LivePulseStats> {
  return getExternalJson<LivePulseStats>(url);
}

function useCountUp(value: number, duration = 650) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const from = previousValue.current;
    const to = value;
    const startedAt = performance.now();
    let frameId = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(from + (to - from) * eased));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      } else {
        previousValue.current = to;
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, [duration, value]);

  return displayValue;
}

function PulseDot() {
  return (
    <span className="relative flex size-2.5" aria-hidden="true">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
      <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.85)]" />
    </span>
  );
}

function CountUpValue({ value }: { value: number }) {
  const displayValue = useCountUp(value);
  return <span>{displayValue.toLocaleString("en-IN")}</span>;
}

export function LivePulseWidget({
  statsUrl = "/api/live-pulse",
  initialStats = defaultStats,
  storageKey = "elv-live-pulse-dismissed",
  className,
}: LivePulseWidgetProps) {
  const [minimized, setMinimized] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(storageKey) === "true";
  });

  const { data, isValidating } = useSWR<LivePulseStats>(statsUrl, fetchStats, {
    fallbackData: initialStats,
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  });

  const stats = data ?? initialStats;
  const updatedLabel = useMemo(
    () => (isValidating ? "Syncing" : "Refreshes every 30s"),
    [isValidating],
  );

  const dismiss = () => {
    localStorage.setItem(storageKey, "true");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <motion.aside
      drag
      dragMomentum={false}
      dragElastic={0.08}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className={cn(
        "fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-[340px] cursor-grab touch-none text-white active:cursor-grabbing",
        className,
      )}
      aria-label="Draggable live pulse widget"
    >
      <div className="pointer-events-none absolute -inset-3 rounded-xl bg-elv-iris/25 blur-2xl" />

      <AnimatePresence initial={false} mode="wait">
        {minimized ? (
          <motion.button
            key="pill"
            type="button"
            onClick={() => setMinimized(false)}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.18 }}
            className="relative flex items-center gap-2 rounded-full border border-white/10 bg-elv-dark-2/90 px-4 py-2 text-xs font-black text-white shadow-floating backdrop-blur-2xl ring-1 ring-elv-iris/30"
            aria-label="Expand live pulse widget"
          >
            <PulseDot />
            LIVE
          </motion.button>
        ) : (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative overflow-hidden rounded-lg border border-white/10 bg-elv-dark-2/90 shadow-floating backdrop-blur-2xl ring-1 ring-elv-iris/30"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(79,70,229,0.34),transparent_9rem),radial-gradient(circle_at_100%_20%,rgba(124,58,237,0.22),transparent_9rem)]" />
            <div className="relative border-b border-white/10 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <PulseDot />
                    <p className="text-sm font-black tracking-tight">LIVE Pulse</p>
                    <span className="rounded-full border border-elv-iris/40 bg-elv-iris/20 px-2 py-0.5 text-[10px] font-black uppercase text-indigo-100">
                      Realtime
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] font-semibold text-white/58">{updatedLabel}</p>
                </div>

                <div className="flex items-center gap-1">
                  <span className="hidden items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase text-white/45 sm:inline-flex">
                    <GripHorizontal className="size-3" />
                    Drag
                  </span>
                  <button
                    type="button"
                    onClick={() => setMinimized(true)}
                    className="grid size-8 place-items-center rounded-md text-white/55 transition hover:bg-white/10 hover:text-white"
                    aria-label="Minimize live pulse widget"
                  >
                    <Minus className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="grid size-8 place-items-center rounded-md text-white/55 transition hover:bg-rose-500/15 hover:text-rose-200"
                    aria-label="Dismiss live pulse widget"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="relative grid gap-2 p-3">
              {statItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.06] px-3 py-2.5 shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`grid size-9 place-items-center rounded-md bg-gradient-to-br ${item.accent} text-sm shadow-sm`}>
                        <span aria-hidden="true">{item.emoji}</span>
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-white/62">{item.label}</p>
                        <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-black uppercase text-white/38">
                          <Icon className="size-3" />
                          Live metric
                        </p>
                      </div>
                    </div>
                    <p className="font-mono text-xl font-black tabular-nums text-white">
                      <CountUpValue value={stats[item.key]} />
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="relative border-t border-white/10 bg-black/16 px-4 py-2 text-[11px] font-bold text-white/45">
              Iris-accent platform activity monitor
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}

export default LivePulseWidget;
