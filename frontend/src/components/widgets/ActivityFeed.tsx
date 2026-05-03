import Link from "next/link";
import { Clock3 } from "lucide-react";
import { cn } from "@/components/ui/utils";

export type ActivityTone = "success" | "warning" | "danger" | "info" | "neutral";

export type ActivityFeedItem = {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  tone?: ActivityTone;
  href?: string;
};

export type ActivityFeedProps = {
  items: ActivityFeedItem[];
  emptyLabel?: string;
  className?: string;
};

const toneClassNames: Record<ActivityTone, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-sky-500",
  neutral: "bg-slate-400",
};

export function ActivityFeed({ items, emptyLabel = "No recent activity", className }: ActivityFeedProps) {
  return (
    <div className={cn("grid gap-3", className)} aria-live="polite">
      {items.length ? (
        items.map((item) => {
          const content = (
            <>
              <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", toneClassNames[item.tone ?? "neutral"])} aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-sm font-black text-foreground dark:text-white">{item.title}</span>
                {item.description ? <span className="mt-0.5 block text-xs leading-5 text-muted-foreground dark:text-white/60">{item.description}</span> : null}
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground dark:text-white/45">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.timestamp}
                </span>
              </span>
            </>
          );

          return item.href ? (
            <Link
              key={item.id}
              href={item.href}
              className="flex gap-3 rounded-md border border-border-subtle bg-surface px-3 py-2 transition hover:border-primary/30 hover:bg-primary-subtle dark:border-elv-dark-border dark:bg-elv-dark-2"
            >
              {content}
            </Link>
          ) : (
            <div
              key={item.id}
              className="flex gap-3 rounded-md border border-border-subtle bg-surface px-3 py-2 dark:border-elv-dark-border dark:bg-elv-dark-2"
            >
              {content}
            </div>
          );
        })
      ) : (
        <p className="rounded-md border border-dashed border-border-subtle px-3 py-4 text-center text-sm font-bold text-muted-foreground dark:border-elv-dark-border">
          {emptyLabel}
        </p>
      )}
    </div>
  );
}
