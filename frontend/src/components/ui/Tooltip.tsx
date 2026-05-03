import type { ReactNode } from "react";
import { useId } from "react";
import { cn } from "./utils";

export type TooltipSide = "top" | "right" | "bottom" | "left";

export type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
  side?: TooltipSide;
  className?: string;
  contentClassName?: string;
};

const sideClassNames: Record<TooltipSide, string> = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
  bottom: "left-1/2 top-full mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
};

export function Tooltip({
  children,
  content,
  side = "top",
  className,
  contentClassName,
}: TooltipProps) {
  const tooltipId = useId();

  return (
    <span className={cn("group/tooltip relative inline-flex", className)} aria-describedby={tooltipId} tabIndex={0}>
      {children}
      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 w-max max-w-64 rounded-md border border-white/50 bg-white/90 px-2.5 py-1.5 text-xs font-bold text-foreground opacity-0 shadow-lg backdrop-blur-xl transition group-hover/tooltip:opacity-100 group-focus/tooltip:opacity-100 dark:border-elv-dark-border dark:bg-elv-dark-2/95 dark:text-white",
          sideClassNames[side],
          contentClassName,
        )}
      >
        {content}
      </span>
    </span>
  );
}
