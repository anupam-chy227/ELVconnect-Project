"use client";

import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  GripHorizontal,
  Minus,
  ShieldCheck,
  TrendingUp,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type LiveStat = {
  label: string;
  value: number;
  suffix?: string;
  delta: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
};

const marketTicks = ["NCR", "Mumbai", "Pune", "Bengaluru", "Hyderabad", "Jaipur"];

export default function FloatingLiveStatsWidget() {
  const [minimized, setMinimized] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTick((current) => current + 1);
    }, 3600);

    return () => window.clearInterval(interval);
  }, []);

  const stats = useMemo<LiveStat[]>(
    () => [
      {
        label: "Engineers",
        value: 184 + (tick % 7),
        delta: "+12 today",
        icon: UsersRound,
        gradient: "from-sky-400 to-blue-600",
      },
      {
        label: "Live jobs",
        value: 42 + (tick % 5),
        delta: "+8.4%",
        icon: BriefcaseBusiness,
        gradient: "from-indigo-400 to-violet-600",
      },
      {
        label: "Closed",
        value: 128 + Math.floor(tick / 2),
        suffix: "+",
        delta: "98% SLA",
        icon: CheckCircle2,
        gradient: "from-emerald-400 to-teal-600",
      },
    ],
    [tick],
  );

  const activeCity = marketTicks[tick % marketTicks.length];

  if (dismissed) {
    return (
      <motion.button
        type="button"
        aria-label="Open live market widget"
        onClick={() => {
          setDismissed(false);
          setMinimized(false);
        }}
        drag
        dragMomentum={false}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-white/70 bg-white/82 px-3 py-2 text-xs font-black text-slate-800 shadow-floating backdrop-blur-2xl dark:border-slate-700/70 dark:bg-slate-950/82 dark:text-slate-100"
      >
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
          <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
        </span>
        Live market
      </motion.button>
    );
  }

  return (
    <motion.aside
      aria-label="Draggable live market stats"
      drag
      dragMomentum={false}
      dragElastic={0.08}
      initial={{ y: 80, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="fixed bottom-4 right-4 z-40 w-[calc(100vw-2rem)] max-w-[380px] cursor-grab active:cursor-grabbing"
    >
      <div className="pointer-events-none absolute -inset-4 rounded-[1.4rem] bg-gradient-to-br from-indigo-500/22 via-sky-500/14 to-emerald-400/16 blur-3xl" />
      <div className="relative rounded-md bg-gradient-to-br from-white/80 via-indigo-200/60 to-sky-200/60 p-[1px] shadow-floating dark:from-slate-600/60 dark:via-indigo-500/40 dark:to-sky-500/30">
        <div className="relative overflow-hidden rounded-md border border-white/35 bg-white/74 shadow-2xl backdrop-blur-2xl dark:border-slate-700/55 dark:bg-slate-950/74">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,91,255,0.18),transparent_13rem),radial-gradient(circle_at_100%_30%,rgba(14,165,233,0.14),transparent_11rem)]" />

          <div className="relative flex items-start justify-between border-b border-white/50 px-4 py-3 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-md bg-slate-950 text-white shadow-md dark:bg-white dark:text-slate-950">
                <TrendingUp className="size-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-foreground">ELV Live Market</p>
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.8)]" />
                  </span>
                </div>
                <p className="text-[11px] font-bold text-muted-foreground">Trading-style platform pulse</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="hidden rounded-md border border-border-subtle bg-white/60 px-2 py-1 text-[10px] font-black uppercase text-muted-foreground backdrop-blur-xl sm:inline-flex">
                <GripHorizontal className="mr-1 size-3" />
                Drag
              </span>
              <button
                type="button"
                aria-label={minimized ? "Expand live market widget" : "Minimize live market widget"}
                onClick={() => setMinimized((value) => !value)}
                className="grid size-8 place-items-center rounded-md text-muted-foreground transition hover:bg-white/70 hover:text-foreground dark:hover:bg-slate-800"
              >
                <Minus className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Dismiss live market widget"
                onClick={() => setDismissed(true)}
                className="grid size-8 place-items-center rounded-md text-muted-foreground transition hover:bg-danger-subtle hover:text-danger"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {!minimized ? (
              <motion.div
                key="expanded"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className="relative overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-2 p-3">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;

                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}
                        className="rounded-md border border-white/60 bg-white/64 p-2.5 shadow-sm backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/62"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`grid size-7 place-items-center rounded-md bg-gradient-to-br ${stat.gradient} text-white shadow-sm`}>
                            <Icon className="size-3.5" />
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-success">
                            <ArrowUpRight className="size-3" />
                            {stat.delta}
                          </span>
                        </div>
                        <p className="mt-3 font-mono text-xl font-black tracking-tight text-foreground">
                          {stat.value}
                          {stat.suffix}
                        </p>
                        <p className="text-[10px] font-black uppercase text-muted-foreground">{stat.label}</p>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mx-3 mb-3 rounded-md border border-white/60 bg-slate-950 p-3 text-white shadow-md dark:border-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="grid size-9 place-items-center rounded-md bg-white/10 text-emerald-300">
                        <Activity className="size-4" />
                      </span>
                      <div>
                        <p className="text-xs font-black uppercase text-slate-300">Market feed</p>
                        <p className="text-sm font-black">{activeCity} demand rising</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-black text-emerald-300">+{7 + (tick % 4)}%</p>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Live</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3">
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        key={tick}
                        initial={{ width: "34%" }}
                        animate={{ width: `${58 + (tick % 5) * 6}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-sky-300 to-indigo-300 shadow-[0_0_22px_rgba(56,189,248,0.55)]"
                      />
                    </div>
                    <WalletCards className="size-4 text-sky-300" />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/50 bg-white/42 px-4 py-2 text-[11px] font-bold text-muted-foreground backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/42">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-success" />
                    Secure payment rail active
                  </span>
                  <span>Updated {tick + 1}s</span>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="minimized"
                type="button"
                onClick={() => setMinimized(false)}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.24 }}
                className="relative flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="inline-flex items-center gap-2 text-sm font-black text-foreground">
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                  </span>
                  {stats[1].value} live jobs
                </span>
                <span className="text-xs font-black text-success">+{7 + (tick % 4)}%</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
