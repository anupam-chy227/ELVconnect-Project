import React from "react";
import { cn } from "@/components/ui/utils";

interface MaterialSymbolProps {
  name: string;
  className?: string;
  filled?: boolean;
}

export function MaterialSymbol({
  name,
  className = "",
  filled = false,
}: MaterialSymbolProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined", filled && "[font-variation-settings:'FILL'_1]", className)}
    >
      {name}
    </span>
  );
}
