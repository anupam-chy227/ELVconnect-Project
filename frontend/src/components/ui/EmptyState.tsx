import type { ReactNode } from "react";
import { SearchX } from "lucide-react";
import { Button } from "./Button";

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface p-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle text-primary">
        {icon ?? <SearchX className="h-6 w-6" />}
      </div>
      <h3 className="mt-3 text-base font-bold text-foreground">{title}</h3>
      {description ? <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button type="button" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
