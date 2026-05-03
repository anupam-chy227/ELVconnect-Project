"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileText,
  Globe2,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Map,
  Menu,
  Plus,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

type AdminNavSection = {
  label: string;
  items: AdminNavItem[];
};

const adminNavSections: AdminNavSection[] = [
  {
    label: "Command",
    items: [
      { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard, badge: "Live" },
      { label: "Projects", href: "/admin/projects", icon: BriefcaseBusiness },
      { label: "Vendors", href: "/admin/vendors", icon: Building2 },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
    ],
  },
  {
    label: "Assurance",
    items: [
      { label: "QA & Audits", href: "/admin/qa-audit", icon: ClipboardCheck },
      { label: "AI Insights", href: "/admin/ai-insights", icon: BrainCircuit, badge: "AI" },
      { label: "Reports", href: "/admin/reports", icon: FileText },
    ],
  },
  {
    label: "Markets",
    items: [
      { label: "City Insights", href: "/admin/city-insights", icon: Map },
    ],
  },
];

const quickStats = [
  { label: "SLA", value: "98.7%" },
  { label: "Risk", value: "3.1%" },
  { label: "Live", value: "4,289" },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminSidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      <AnimatePresence>
        {mobileOpen ? (
          <motion.button
            type="button"
            aria-label="Close admin menu"
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        ) : null}
      </AnimatePresence>

      <motion.aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[292px] flex-col overflow-hidden border-r border-white/10 bg-slate-950 text-white shadow-2xl shadow-slate-950/30 transition-transform duration-300 md:sticky md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        initial={false}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(129,140,248,0.26),transparent_32%),radial-gradient(circle_at_80%_24%,rgba(16,185,129,0.12),transparent_28%)]" />

        <div className="relative flex items-start justify-between gap-3 border-b border-white/10 p-5">
          <Link href="/admin/dashboard" onClick={onClose} className="min-w-0">
            <Image
              src="/ELVLOGO-HQ.png"
              alt="ELV Connect"
              width={210}
              height={60}
              className="h-14 w-auto object-contain brightness-110"
              priority
            />
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-100 backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.12)]" />
              Enterprise control
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-md border border-white/10 bg-white/10 p-2 text-white/70 transition hover:bg-white/15 hover:text-white md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-4 grid grid-cols-3 gap-2 rounded-md border border-white/10 bg-white/[0.06] p-2 backdrop-blur-xl">
            {quickStats.map((stat) => (
              <div key={stat.label} className="rounded-md bg-white/[0.06] p-2 text-center">
                <p className="text-[10px] font-black uppercase tracking-wide text-white/40">{stat.label}</p>
                <p className="mt-1 text-xs font-black text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <nav className="space-y-5">
            {adminNavSections.map((section) => (
              <div key={section.label}>
                <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                  {section.label}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`group flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-sm font-bold transition ${
                          active
                            ? "border-indigo-400/40 bg-white text-slate-950 shadow-lg shadow-indigo-950/20"
                            : "border-transparent text-white/68 hover:border-white/10 hover:bg-white/[0.08] hover:text-white"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition ${
                              active
                                ? "bg-indigo-600 text-white"
                                : "bg-white/[0.08] text-white/70 group-hover:bg-white/[0.12] group-hover:text-white"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.badge ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                              active ? "bg-indigo-50 text-indigo-700" : "bg-white/10 text-white/50"
                            }`}
                          >
                            {item.badge}
                          </span>
                        ) : (
                          <ChevronRight
                            className={`h-3.5 w-3.5 transition ${
                              active ? "text-indigo-600" : "text-white/20 group-hover:text-white/50"
                            }`}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="relative border-t border-white/10 p-4">
          <Link
            href="/post-requirement"
            className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-b from-indigo-500 to-violet-700 px-4 py-3 text-sm font-black text-white shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
          >
            <Plus className="h-4 w-4" />
            Post Requirement
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/trust-safety"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white/[0.1] hover:text-white"
            >
              <LifeBuoy className="h-3.5 w-3.5" />
              Support
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white/[0.1] hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function AdminHeader({ onMenuToggle }: { onMenuToggle: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const currentItem =
    adminNavSections.flatMap((section) => section.items).find((item) => isActivePath(pathname, item.href)) ??
    adminNavSections[0].items[0];
  const CurrentIcon = currentItem.icon;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/78 px-4 py-3 shadow-sm shadow-slate-950/[0.03] backdrop-blur-2xl dark:border-slate-800/70 dark:bg-slate-950/74 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label="Open admin menu"
            className="rounded-md border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden h-10 w-10 items-center justify-center rounded-md bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-200 dark:ring-indigo-900 sm:flex">
            <CurrentIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-black text-slate-950 dark:text-white">{currentItem.label}</p>
              <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900 sm:inline-flex">
                Secure
              </span>
            </div>
            <p className="mt-0.5 hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:block">
              ELV Connect enterprise control system
            </p>
          </div>
        </div>

        <div className="hidden flex-1 justify-center px-6 lg:flex">
          <label className="relative w-full max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              aria-label="Search projects, vendors, payments, QA, and reports"
              className="h-10 w-full rounded-md border border-slate-200 bg-white/80 pl-10 pr-4 text-sm font-semibold text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100 dark:focus:ring-indigo-950"
            />
          </label>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900 sm:flex">
            <button className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white">
              EN
            </button>
            <button className="rounded-full px-3 py-1 text-xs font-black text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              HI
            </button>
          </div>
          <button
            type="button"
            aria-label="Language controls"
            className="rounded-md border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <Globe2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-md border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.12)]" />
          </button>

          <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-2 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="hidden text-right sm:block">
              <p className="max-w-36 truncate text-xs font-black text-slate-950 dark:text-white">
                {user?.profile.fullName || "Admin User"}
              </p>
              <p className="text-[11px] font-semibold capitalize text-slate-500 dark:text-slate-400">
                {user?.role?.replace("_", " ") || "Super Admin"}
              </p>
            </div>
            {user?.profile.avatar ? (
              <img
                src={user.profile.avatar}
                alt={user.profile.fullName}
                className="h-9 w-9 rounded-md border border-slate-200 object-cover dark:border-slate-800"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-violet-700 text-sm font-black text-white shadow-sm">
                {user?.profile.fullName?.charAt(0) || "A"}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(99,102,241,0.12),transparent_28%),radial-gradient(circle_at_92%_10%,rgba(16,185,129,0.1),transparent_24%)]" />
      <div className="relative flex min-h-screen">
        <AdminSidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <main className="min-w-0 flex-1">
          <AdminHeader onMenuToggle={() => setMobileMenuOpen((current) => !current)} />
          <div className="mx-auto w-full max-w-[1540px] px-4 py-5 md:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
