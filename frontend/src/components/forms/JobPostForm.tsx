import type { FormHTMLAttributes, ReactNode } from "react";
import { cn } from "@/components/ui/utils";

export type JobPostFormProps = FormHTMLAttributes<HTMLFormElement> & {
  sidebar?: ReactNode;
  summary?: ReactNode;
  footer?: ReactNode;
};

export function JobPostForm({
  sidebar,
  summary,
  footer,
  children,
  className,
  ...props
}: JobPostFormProps) {
  return (
    <form
      className={cn("grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_320px]", className)}
      {...props}
    >
      {sidebar ? <aside className="lg:sticky lg:top-6 lg:self-start">{sidebar}</aside> : null}
      <section className="min-w-0 rounded-lg border border-border-subtle bg-surface p-5 shadow-sm dark:border-elv-dark-border dark:bg-elv-dark-2">
        {children}
        {footer ? <div className="mt-6 border-t border-border-subtle pt-4 dark:border-elv-dark-border">{footer}</div> : null}
      </section>
      {summary ? <aside className="lg:sticky lg:top-6 lg:self-start">{summary}</aside> : null}
    </form>
  );
}
