import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/components/ui/utils";

export type PageHeaderBreadcrumb = {
  label: string;
  href?: string;
};

export type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  breadcrumbs?: PageHeaderBreadcrumb[];
  action?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  breadcrumbs,
  action,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        {breadcrumbs?.length ? (
          <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs font-bold text-muted-foreground">
            {breadcrumbs.map((item, index) => (
              <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
                {item.href ? (
                  <Link href={item.href} className="transition hover:text-primary">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current="page">{item.label}</span>
                )}
                {index < breadcrumbs.length - 1 ? <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /> : null}
              </span>
            ))}
          </nav>
        ) : null}

        {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.08em] text-primary">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground dark:text-white md:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground dark:text-white/70">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
