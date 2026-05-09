import Link from "next/link";
import {
  Bell,
  Building2,
  ClipboardList,
  Home,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Card, VerificationBadge } from "@/components/ui";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Post Requirement", href: "/post-requirement", icon: ClipboardList },
  { label: "Matches", href: "/matches", icon: ShieldCheck },
  { label: "Vendor", href: "/vendor", icon: Building2 },
  { label: "Admin", href: "/admin", icon: LayoutDashboard },
];

export function WorkspaceShell({
  title,
  subtitle,
  children,
  actions,
  notice,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  notice?: React.ReactNode;
}) {
  return (
    <div className="premium-shell min-h-screen text-foreground">
      {notice ? <div className="mx-auto max-w-7xl px-4 pt-4">{notice}</div> : null}

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[220px_1fr]">
        <Card variant="default" padding="sm" className="hidden lg:block">
          <div className="mb-4 rounded-md bg-primary-subtle p-3">
            <p className="text-xs font-black uppercase tracking-wide text-primary">ELV Connect</p>
            <p className="mt-1 text-[11px] font-semibold text-muted-foreground">Execution workspace</p>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-md border border-transparent px-3 py-2 text-xs font-black text-muted-foreground transition hover:border-primary/25 hover:bg-primary-subtle hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </Card>

        <div className="min-w-0 space-y-4">
          <Card variant="glass">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                  Compliance-first operations console
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{subtitle}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <VerificationBadge level="verified" label="Verified workflow" />
                  <VerificationBadge level="escrow" label="UPI protected" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {actions}
                <button className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">
                  <Bell className="h-4 w-4" />
                  Alerts
                </button>
              </div>
            </div>
          </Card>

          {children}

          <Card variant="panel" padding="sm" className="text-xs text-muted-foreground">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <span>ELV Connect workspace for verified infrastructure delivery.</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                Pan-India ELV operations
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function DataCard({
  title,
  value,
  caption,
  icon: Icon = UserRound,
}: {
  title: string;
  value: string;
  caption: string;
  icon?: React.ElementType;
}) {
  return (
    <Card variant="stat">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{caption}</p>
        </div>
        <span className="rounded-md bg-primary-container/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </Card>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "approved" || status === "completed"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "delayed" || status === "high"
        ? "bg-rose-50 text-rose-700 border-rose-200"
        : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${tone}`}>
      {status}
    </span>
  );
}
