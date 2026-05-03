"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Quote, ShieldCheck, Star } from "lucide-react";
import { cn } from "@/components/ui/utils";

type ReviewSpotlight = {
  company: string;
  location: string;
  scope: string;
  quote: string;
  result: string;
};

const reviews: ReviewSpotlight[] = [
  {
    company: "Apex Auto Components",
    location: "Manesar",
    scope: "Factory CCTV and access control rollout",
    quote: "The team matched us with verified engineers who understood industrial site access, camera coverage, and handover documentation.",
    result: "16 cameras commissioned in 7 days",
  },
  {
    company: "Northline Warehousing",
    location: "Gurugram",
    scope: "Fire alarm audit and AMC planning",
    quote: "Compliance documents, site visit notes, and quote comparison stayed in one workflow, which made approvals faster.",
    result: "Fire audit closed before inspection",
  },
  {
    company: "Metro CoWorks",
    location: "Noida",
    scope: "Biometric access control upgrade",
    quote: "Engineer verification and payment milestones gave our admin team the confidence to move without back-and-forth calls.",
    result: "3 access points upgraded over a weekend",
  },
];

export function BusinessReviewSpotlight({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const active = reviews[index];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % reviews.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <aside
      className={cn(
        "fixed bottom-4 left-4 z-30 hidden w-[360px] overflow-hidden rounded-md border border-white/70 bg-white/82 shadow-floating backdrop-blur-2xl dark:border-slate-800/70 dark:bg-slate-950/82 xl:block",
        className,
      )}
      aria-label="Rotating business review spotlight"
    >
      <div className="border-b border-border-subtle bg-gradient-to-r from-primary-subtle via-white to-sky-50 px-4 py-3 dark:from-indigo-950/30 dark:via-slate-950 dark:to-sky-950/20">
        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase text-primary">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Business review
          </p>
          <div className="flex items-center gap-1 text-amber-500" aria-label="Five star review">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active.company}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24 }}
          className="p-4"
        >
          <Quote className="h-5 w-5 text-primary" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold leading-6 text-foreground">&quot;{active.quote}&quot;</p>
          <div className="mt-4 rounded-md border border-border-subtle bg-surface-muted p-3">
            <p className="text-sm font-black text-foreground">{active.company}</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              {active.location} - {active.scope}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-success">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {active.result}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}
