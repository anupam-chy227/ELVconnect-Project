"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Banknote,
  BrainCircuit,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileSearch,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  UserCheck,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";
import { cn } from "@/components/ui/utils";

export type SidebarRole = "CLIENT" | "ENGINEER" | "ADMIN";

type SidebarUser = {
  name?: string;
  email?: string;
  avatar?: string;
};

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

type SidebarProps = {
  role?: SidebarRole | UserRole;
  user?: SidebarUser;
  activePath?: string;
  defaultCollapsed?: boolean;
  onLogout?: () => void | Promise<void>;
  className?: string;
};

const roleLabels: Record<SidebarRole, string> = {
  CLIENT: "Client",
  ENGINEER: "Engineer",
  ADMIN: "Admin",
};

const navSections: Record<SidebarRole, NavSection[]> = {
  CLIENT: [
    {
      label: "Workspace",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Post a Job", href: "/post-requirement", icon: BriefcaseBusiness },
        { label: "My Projects", href: "/dashboard/projects", icon: ClipboardCheck },
      ],
    },
    {
      label: "Network",
      items: [
        { label: "Engineers", href: "/dashboard/engineers", icon: UsersRound },
        { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
      ],
    },
    {
      label: "Account",
      items: [{ label: "Settings", href: "/dashboard/settings", icon: Settings }],
    },
  ],
  ENGINEER: [
    {
      label: "Workspace",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Find Jobs", href: "/jobs", icon: Search },
        { label: "My Work", href: "/dashboard/work", icon: ClipboardCheck },
      ],
    },
    {
      label: "Business",
      items: [
        { label: "Earnings", href: "/dashboard/earnings", icon: Banknote },
        { label: "Verification", href: "/dashboard/verification", icon: ShieldCheck },
      ],
    },
    {
      label: "Account",
      items: [{ label: "Settings", href: "/dashboard/settings", icon: Settings }],
    },
  ],
  ADMIN: [
    {
      label: "Command",
      items: [
        { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Verification Queue", href: "/admin/verification", icon: UserCheck },
        { label: "Job Moderation", href: "/admin/jobs", icon: FileSearch },
      ],
    },
    {
      label: "Operations",
      items: [
        { label: "Vendor Management", href: "/admin/vendors", icon: UsersRound },
        { label: "Payments & Escrow", href: "/admin/payments", icon: WalletCards },
        { label: "QA & Audit", href: "/admin/qa-audit", icon: ClipboardCheck },
      ],
    },
    {
      label: "Intelligence",
      items: [
        { label: "AI Insights", href: "/admin/ai-insights", icon: BrainCircuit },
        { label: "Platform Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ],
};

function normalizeRole(role?: SidebarRole | UserRole): SidebarRole {
  if (role === "admin" || role === "ADMIN") return "ADMIN";
  if (role === "service_provider" || role === "ENGINEER") return "ENGINEER";
  return "CLIENT";
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name?: string, email?: string) {
  const source = name || email || "ELV User";
  return source
    .split(/[ @._-]/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Tooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-20 -translate-y-1/2 whitespace-nowrap rounded-md border border-border-subtle bg-surface px-2.5 py-1.5 text-xs font-bold text-foreground opacity-0 shadow-lg transition group-hover:opacity-100">
      {label}
    </span>
  );
}

export function Sidebar({
  role,
  user,
  activePath,
  defaultCollapsed = false,
  onLogout,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: authUser, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const sidebarRole = normalizeRole(role ?? authUser?.role);
  const sections = useMemo(() => navSections[sidebarRole], [sidebarRole]);
  const currentPath = activePath ?? pathname;
  const displayUser = {
    name: user?.name ?? authUser?.profile.companyName ?? authUser?.profile.fullName ?? "ELV user",
    email: user?.email ?? authUser?.email,
    avatar: user?.avatar ?? authUser?.profile.avatar,
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
      return;
    }

    await logout();
    router.push("/login");
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -18 }}
      animate={{
        opacity: 1,
        x: 0,
        width: collapsed ? 72 : 288,
      }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative flex h-screen shrink-0 flex-col overflow-hidden border-r border-border-subtle bg-surface text-foreground shadow-lg dark:border-elv-dark-border dark:bg-elv-dark-1 dark:text-white",
        className,
      )}
      aria-label={`${roleLabels[sidebarRole]} navigation`}
    >
      <div className="flex h-[72px] items-center justify-between border-b border-border-subtle bg-surface-raised px-3 dark:border-elv-dark-border dark:bg-elv-dark-1">
        <Link
          href={sidebarRole === "ADMIN" ? "/admin/dashboard" : "/dashboard"}
          className={cn("flex min-w-0 items-center gap-3", collapsed && "w-full justify-center")}
          aria-label="ELV Connect dashboard"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary text-sm font-black text-on-primary shadow-sm">
            ELV
          </span>
          {!collapsed ? (
            <span className="min-w-0">
              <span className="block truncate text-sm font-black tracking-tight">ELV Connect</span>
              <span className="block truncate text-[10px] font-bold uppercase text-muted-foreground">
                {roleLabels[sidebarRole]} Console
              </span>
            </span>
          ) : null}
        </Link>

        {!collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="rounded-md border border-border-subtle bg-surface p-2 text-muted-foreground shadow-xs transition hover:-translate-y-px hover:bg-surface-muted hover:text-foreground dark:border-elv-dark-border dark:bg-elv-dark-2 dark:text-white/70 dark:hover:text-white"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {collapsed ? (
        <div className="border-b border-border-subtle px-3 py-3 dark:border-elv-dark-border">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="grid h-10 w-full place-items-center rounded-md border border-border-subtle bg-surface text-muted-foreground shadow-xs transition hover:-translate-y-px hover:bg-surface-muted hover:text-foreground dark:border-elv-dark-border dark:bg-elv-dark-2 dark:text-white/70 dark:hover:text-white"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => (
            <div
              key={section.label}
              className={cn(sectionIndex > 0 && "border-t border-border-subtle pt-4 dark:border-elv-dark-border")}
            >
              {!collapsed ? (
                <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                  {section.label}
                </p>
              ) : null}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActivePath(currentPath, item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex min-h-11 items-center gap-3 overflow-visible rounded-md border px-3 text-sm font-bold transition-all duration-200",
                        collapsed ? "justify-center px-0" : "justify-start",
                        active
                          ? "border-primary/20 bg-primary-subtle text-primary shadow-sm"
                          : "border-transparent text-muted-foreground hover:-translate-y-px hover:border-border-subtle hover:bg-surface-muted hover:text-foreground hover:shadow-xs",
                      )}
                    >
                      {active ? (
                        <motion.span
                          layoutId="sidebar-active-accent"
                          className="absolute left-0 top-1.5 h-8 w-1 rounded-r-full bg-primary"
                        />
                      ) : null}
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed ? <span className="truncate">{item.label}</span> : <Tooltip label={item.label} />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-border-subtle p-3 dark:border-elv-dark-border">
        <div
          className={cn(
            "mb-2 flex items-center gap-3 rounded-md border border-border-subtle bg-surface-muted p-2",
            collapsed && "justify-center border-transparent bg-transparent p-0",
          )}
        >
          {displayUser.avatar ? (
            <img
              src={displayUser.avatar}
              alt={displayUser.name}
              className="h-10 w-10 shrink-0 rounded-full border border-border-subtle object-cover shadow-xs"
            />
          ) : (
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-black text-white shadow-xs">
              {getInitials(displayUser.name, displayUser.email)}
            </div>
          )}

          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-foreground">{displayUser.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-full border border-primary/20 bg-primary-subtle px-2 py-0.5 text-[10px] font-black uppercase text-primary">
                  {roleLabels[sidebarRole]}
                </span>
                {displayUser.email ? (
                  <span className="min-w-0 truncate text-[11px] text-muted-foreground">{displayUser.email}</span>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "group relative flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-bold text-muted-foreground transition-all hover:-translate-y-px hover:bg-danger-subtle hover:text-danger",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed ? <span>Logout</span> : <Tooltip label="Logout" />}
        </button>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
