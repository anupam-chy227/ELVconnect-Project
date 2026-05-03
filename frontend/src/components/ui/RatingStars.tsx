import { Star } from "lucide-react";
import { cn } from "./utils";

export type RatingStarsProps = {
  value: number;
  max?: number;
  showValue?: boolean;
  className?: string;
};

export function RatingStars({ value, max = 5, showValue = true, className }: RatingStarsProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {Array.from({ length: max }).map((_, index) => {
        const active = index < Math.round(value);
        return <Star key={index} className={cn("h-4 w-4", active ? "fill-amber-400 text-amber-400" : "text-slate-300")} />;
      })}
      {showValue ? <span className="ml-1 text-xs font-bold text-slate-700 dark:text-slate-200">{value.toFixed(1)}</span> : null}
    </span>
  );
}
