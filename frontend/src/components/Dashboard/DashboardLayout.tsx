"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  show: boolean;
};

const sectionTitles: Record<string, string> = {
  "/dashboard": "Operations Overview",
  "/dashboard/jobs": "Projects & Jobs",
  "/dashboard/invoices": "Payments",
  "/dashboard/payments": "Payments",
  "/dashboard/engineers": "Engineers",
  "/dashboard/applications": "Applications",
  "/dashboard/profile": "Settings",
};

function getSectionTitle(pathname: string) {
  const match = Object.keys(sectionTitles)
    .sort((a, b) => b.length - a.length)
    .find((path) => pathname === path || pathname.startsWith(`${path}/`));

  return match ? sectionTitles[match] : "Dashboard";
}

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function UserAvatar({ fullName, avatar }: { fullName?: string; avatar?: string }) {
  const initials = (fullName || "EC")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={fullName || "User avatar"}
        className="h-9 w-9 rounded-full border border-border-subtle object-cover shadow-xs"
      />
    );
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white shadow-xs">
      {initials}
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = useMemo<MenuItem[]>(
    () => [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard, show: true },
      { label: "Jobs", href: "/dashboard/jobs", icon: BriefcaseBusiness, show: user?.role === "customer" },
      { label: "Applications", href: "/dashboard/applications", icon: ShieldCheck, show: user?.role === "service_provider" },
      { label: "Payments", href: "/dashboard/invoices", icon: CreditCard, show: true },
      { label: "Engineers", href: "/dashboard/engineers", icon: UsersRound, show: user?.role === "customer" },
      { label: "Settings", href: "/dashboard/profile", icon: Settings, show: true },
    ],
    [user?.role],
  );

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    router.push("/login");
  };

  const sidebarWidth = collapsed ? "md:pl-[88px]" : "md:pl-[280px]";

  return (
    <ProtectedRoute>
      <div className="min-h-screen premium-shell text-foreground">
        {mobileOpen ? (
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-surface-overlay md:hidden"
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border-subtle bg-surface shadow-lg transition-all duration-300 ${
            collapsed ? "w-[88px]" : "w-[280px]"
          } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
          <div className="flex h-20 items-center justify-between border-b border-border-subtle bg-surface-raised/80 px-4 backdrop-blur-xl">
            <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
              <Image
                src="/ELVLOGO-HQ.png"
                alt="ELV Connect"
                width={170}
                height={48}
                className={collapsed ? "h-10 w-10 rounded-md object-cover object-left" : "h-12 w-auto object-contain"}
                priority
              />
              {!collapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-black tracking-tight text-foreground">ELV Connect</p>
                  <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Ops Console
                  </p>
                </div>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-md border border-border-subtle p-2 text-muted-foreground md:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            {!collapsed ? (
              <div className="mb-4 rounded-md border border-border-subtle bg-gradient-to-br from-primary-subtle via-white to-secondary-subtle p-3 shadow-sm dark:from-indigo-950/30 dark:via-slate-900 dark:to-sky-950/20">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Signed in</p>
                <p className="mt-1 truncate text-sm font-bold text-foreground">
                  {user?.profile.companyName || user?.profile.fullName || user?.email}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            ) : null}

            <nav className="space-y-1">
              {menuItems
                .filter((item) => item.show)
                .map((item) => {
                  const Icon = item.icon;
                  const active = isActiveRoute(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-bold transition ${
                        active
                          ? "border-primary/20 bg-gradient-to-r from-primary-subtle to-secondary-subtle text-primary shadow-sm"
                          : "border-transparent text-muted-foreground hover:border-border-subtle hover:bg-surface-muted hover:text-foreground"
                      } ${collapsed ? "justify-center" : ""}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed ? <span>{item.label}</span> : null}
                    </Link>
                  );
                })}
            </nav>
          </div>

          <div className="border-t border-border-subtle p-3">
            <Link
              href={user?.role === "service_provider" ? "/jobs" : "/dashboard/jobs/create"}
              className={`mb-2 flex items-center justify-center gap-2 rounded-md bg-gradient-to-b from-primary to-primary-container px-3 py-2.5 text-sm font-bold text-on-primary shadow-glow transition hover:-translate-y-0.5 hover:shadow-floating ${
                collapsed ? "px-2" : ""
              }`}
            >
              <BriefcaseBusiness className="h-4 w-4" />
              {!collapsed ? <span>{user?.role === "service_provider" ? "Browse Work" : "New Job"}</span> : null}
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-muted-foreground transition hover:bg-danger-subtle hover:text-danger ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed ? <span>Logout</span> : null}
            </button>
          </div>
        </aside>

        <div className={`min-h-screen transition-all duration-300 ${sidebarWidth}`}>
          <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface-raised/86 backdrop-blur-2xl">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="rounded-lg border border-border-subtle bg-surface px-2.5 py-2 text-muted-foreground shadow-xs md:hidden"
                  aria-label="Open sidebar"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCollapsed((value) => !value)}
                  className="hidden rounded-lg border border-border-subtle bg-surface px-2.5 py-2 text-muted-foreground shadow-xs transition hover:text-foreground md:inline-flex"
                  aria-label="Toggle sidebar"
                >
                  {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {getSectionTitle(pathname)}
                  </p>
                  <h1 className="truncate text-base font-black text-foreground sm:text-lg">
                    Infrastructure operations
                  </h1>
                </div>
              </div>

              <div className="hidden min-w-[260px] max-w-md flex-1 items-center gap-2 rounded-md border border-border-subtle bg-surface px-3 py-2 shadow-sm lg:flex">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Search projects, invoices, engineers..."
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="relative rounded-md border border-border-subtle bg-surface p-2 text-muted-foreground shadow-sm transition hover:border-primary/25 hover:text-foreground"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
                </button>
                <button
                  type="button"
                  className="hidden rounded-md border border-border-subtle bg-surface p-2 text-muted-foreground shadow-sm transition hover:border-primary/25 hover:text-foreground sm:inline-flex"
                  aria-label="Help"
                >
                  <CircleHelp className="h-4 w-4" />
                </button>
                <div className="hidden text-right sm:block">
                  <p className="max-w-[140px] truncate text-xs font-bold text-foreground">
                    {user?.profile.companyName || user?.profile.fullName || "ELV user"}
                  </p>
                  <p className="text-[11px] capitalize text-muted-foreground">{user?.role?.replace(/_/g, " ")}</p>
                </div>
                <UserAvatar fullName={user?.profile.fullName} avatar={user?.profile.avatar} />
              </div>
            </div>
          </header>

          <main className="px-4 py-5 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
