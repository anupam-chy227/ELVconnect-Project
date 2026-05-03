import type { ReactNode } from "react";
import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/components/ui/utils";

export type ReviewCardProps = {
  quote: string;
  reviewerName: string;
  company: string;
  rating?: number;
  logo?: ReactNode;
  avatar?: string;
  className?: string;
};

export function ReviewCard({
  quote,
  reviewerName,
  company,
  rating = 5,
  logo,
  avatar,
  className,
}: ReviewCardProps) {
  const normalizedRating = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <article className={cn("rounded-lg border border-white/30 bg-white/70 p-5 shadow-glass backdrop-blur-xl dark:border-elv-dark-border dark:bg-elv-dark-2/80", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          {logo ? <div className="mb-3 text-sm font-black text-muted-foreground dark:text-white/70">{logo}</div> : null}
          <div className="flex items-center gap-1" aria-label={`${normalizedRating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={cn("h-4 w-4", index < normalizedRating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-white/20")}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-foreground dark:text-white/82">&quot;{quote}&quot;</p>

      <div className="mt-5 flex items-center gap-3">
        <Avatar name={reviewerName} src={avatar} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-foreground dark:text-white">{reviewerName}</p>
          <p className="truncate text-xs font-bold text-muted-foreground dark:text-white/55">{company}</p>
        </div>
      </div>
    </article>
  );
}
