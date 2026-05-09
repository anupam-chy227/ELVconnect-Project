"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Command,
  CreditCard,
  FileText,
  LogOut,
  Search,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import {
  getLanguageByCode,
  getSavedLanguageCode,
  LANGUAGES,
  LANGUAGE_CHANGE_EVENT,
  setPreferredLanguage,
} from "@/lib/experience-preferences";
import type { UserRole } from "@/types";
import type { AppNotification, NotificationType } from "@/types/api";
import { cn } from "@/components/ui/utils";

type Breadcrumb = {
  label: string;
  href?: string;
};

type AlertItem = {
  id: string;
  title: string;
  description?: string;
  time?: string;
  unread?: boolean;
};

export type CommandPaletteItem = {
  id: string;
  label: string;
  description?: string;
  href?: string;
  type: "page" | "job" | "engineer" | "action";
  icon?: LucideIcon;
  action?: () => void;
};

type TopbarUser = {
  name?: string;
  role?: UserRole | "CLIENT" | "ENGINEER" | "ADMIN";
  city?: string;
  avatar?: string;
};

type TopbarProps = {
  title: string;
  breadcrumbs?: Breadcrumb[];
  alerts?: AlertItem[];
  notificationCount?: number;
  commandItems?: CommandPaletteItem[];
  recentItems?: CommandPaletteItem[];
  user?: TopbarUser;
  onLogout?: () => void | Promise<void>;
  className?: string;
};

const defaultAlerts: AlertItem[] = [
  {
    id: "verification",
    title: "Verification queue updated",
    description: "4 engineers need document review.",
    time: "8m ago",
    unread: true,
  },
  {
    id: "escrow",
    title: "Escrow payment released",
    description: "Phoenix Mall CCTV milestone cleared.",
    time: "32m ago",
  },
  {
    id: "job-match",
    title: "New job match",
    description: "Access control retrofit near your city.",
    time: "1h ago",
  },
];

const defaultCommands: CommandPaletteItem[] = [
  { id: "page-dashboard", label: "Dashboard", description: "Open operations overview", href: "/dashboard", type: "page" },
  { id: "page-post-job", label: "Post a Job", description: "Create a new client requirement", href: "/post-requirement", type: "page" },
  { id: "page-engineers", label: "Engineers", description: "Browse verified ELV engineers", href: "/engineers", type: "page" },
  { id: "job-cctv", label: "Phoenix Mall CCTV Command Center", description: "Job in active delivery", href: "/dashboard/jobs", type: "job" },
  { id: "job-fire", label: "Hospital fire alarm upgrade", description: "High priority job", href: "/dashboard/jobs", type: "job" },
  { id: "engineer-access", label: "Access Control Engineers", description: "Find specialists by category", href: "/engineers?specialization=access_control", type: "engineer" },
  { id: "action-new-invoice", label: "Create Invoice", description: "Start a tax invoice or proforma", href: "/dashboard/invoices/create", type: "action" },
  { id: "action-support", label: "Open Help", description: "Get support and documentation", href: "/help", type: "action" },
];

const avatarBlurDataUrl =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNDQnIGhlaWdodD0nNDQnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzQ0JyBoZWlnaHQ9JzQ0JyByeD0nMjInIGZpbGw9JyNlZGU5ZmUnLz48L3N2Zz4=";

const typeIcon: Record<CommandPaletteItem["type"], LucideIcon> = {
  page: FileText,
  job: Sparkles,
  engineer: UserRound,
  action: Command,
};

const notificationIcon: Record<NotificationType, LucideIcon> = {
  new_application: UsersRound,
  job_assigned: CheckCircle2,
  invoice_created: CreditCard,
  verification_approved: BadgeCheck,
  verification_rejected: XCircle,
};

const notificationTone: Record<NotificationType, string> = {
  new_application: "border-blue-100 bg-blue-50 text-blue-700",
  job_assigned: "border-emerald-100 bg-emerald-50 text-emerald-700",
  invoice_created: "border-violet-100 bg-violet-50 text-violet-700",
  verification_approved: "border-emerald-100 bg-emerald-50 text-emerald-700",
  verification_rejected: "border-rose-100 bg-rose-50 text-rose-700",
};

function timeAgo(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function alertToNotification(alert: AlertItem): AppNotification {
  return {
    id: alert.id,
    type: "new_application",
    message: alert.description ? `${alert.title}: ${alert.description}` : alert.title,
    createdAt: new Date().toISOString(),
    unread: Boolean(alert.unread),
  };
}

function roleLabel(role?: TopbarUser["role"]) {
  if (role === "admin" || role === "ADMIN") return "Admin";
  if (role === "service_provider" || role === "ENGINEER") return "Engineer";
  return "Client";
}

function initials(name?: string) {
  return (name || "ELV User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function scoreItem(item: CommandPaletteItem, query: string) {
  const haystack = `${item.label} ${item.description ?? ""} ${item.type}`.toLowerCase();
  const needle = query.trim().toLowerCase();

  if (!needle) return 1;
  if (haystack.includes(needle)) return 100 - haystack.indexOf(needle);

  let score = 0;
  let index = 0;
  for (const char of needle) {
    const found = haystack.indexOf(char, index);
    if (found === -1) return 0;
    score += Math.max(1, 12 - (found - index));
    index = found + 1;
  }
  return score;
}

function CommandPalette({
  open,
  items,
  recentItems,
  onClose,
}: {
  open: boolean;
  items: CommandPaletteItem[];
  recentItems: CommandPaletteItem[];
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const visibleItems = useMemo(() => {
    if (!query.trim()) return recentItems.length ? recentItems : items.slice(0, 6);

    return items
      .map((item) => ({ item, score: scoreItem(item, query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item)
      .slice(0, 8);
  }, [items, query, recentItems]);

  useEffect(() => {
    if (!open) return;

    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const runItem = (item: CommandPaletteItem) => {
    item.action?.();
    if (item.href) router.push(item.href);
    onClose();
    setQuery("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(visibleItems.length - 1, 0)));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }

    if (event.key === "Enter" && visibleItems[activeIndex]) {
      event.preventDefault();
      runItem(visibleItems[activeIndex]);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] bg-surface-overlay px-4 py-16 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="mx-auto max-w-2xl overflow-hidden rounded-lg border border-border-subtle bg-surface shadow-lg"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, jobs, engineers, actions..."
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1.5 text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
                aria-label="Close command palette"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto p-2">
              <p className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                {query.trim() ? "Results" : "Recent"}
              </p>
              {visibleItems.length ? (
                visibleItems.map((item, index) => {
                  const Icon = item.icon ?? typeIcon[item.type];
                  const active = index === activeIndex;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => runItem(item)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition",
                        active ? "bg-primary-subtle text-primary" : "text-foreground hover:bg-surface-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-md border",
                          active
                            ? "border-primary/20 bg-surface text-primary"
                            : "border-border-subtle bg-surface-muted text-muted-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black">{item.label}</span>
                        {item.description ? (
                          <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
                        ) : null}
                      </span>
                      <span className="rounded-full border border-border-subtle px-2 py-0.5 text-[10px] font-black uppercase text-muted-foreground">
                        {item.type}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-8 text-center text-sm font-semibold text-muted-foreground">
                  No matching commands
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function Topbar({
  title,
  breadcrumbs = [],
  alerts = defaultAlerts,
  notificationCount,
  commandItems = defaultCommands,
  recentItems,
  user,
  onLogout,
  className,
}: TopbarProps) {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();
  const {
    notifications,
    unreadCount: liveUnreadCount,
    markAllAsRead,
  } = useNotifications();
  const [openMenu, setOpenMenu] = useState<"alerts" | "language" | "user" | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [languageCode, setLanguageCode] = useState(() => getSavedLanguageCode());
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedLanguage = getLanguageByCode(languageCode);
  const customNotifications = useMemo(() => alerts.map(alertToNotification), [alerts]);
  const hasCustomAlerts = alerts !== defaultAlerts;
  const notificationItems = notifications.length ? notifications : hasCustomAlerts ? customNotifications : [];
  const unreadCount =
    notificationCount ?? (notifications.length ? liveUnreadCount : notificationItems.filter((item) => item.unread).length);
  const displayUser = {
    name: user?.name ?? authUser?.profile.companyName ?? authUser?.profile.fullName ?? "ELV user",
    role: user?.role ?? authUser?.role,
    city: user?.city ?? authUser?.serviceProvider?.serviceArea?.city ?? "All India",
    avatar: user?.avatar ?? authUser?.profile.avatar,
  };

  const paletteRecentItems = recentItems ?? commandItems.slice(0, 5);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }

      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const syncLanguage = () => setLanguageCode(getSavedLanguageCode());

    syncLanguage();
    window.addEventListener(LANGUAGE_CHANGE_EVENT, syncLanguage);
    window.addEventListener("storage", syncLanguage);

    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, syncLanguage);
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  const chooseLanguage = (code: string) => {
    const language = getLanguageByCode(code);
    setLanguageCode(language.code);
    setPreferredLanguage(language.code);
    setOpenMenu(null);
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    } else {
      await logout();
      router.push("/login");
    }
  };

  return (
    <>
      <header
        ref={rootRef}
        className={cn(
          "sticky top-0 z-40 border-b border-border-subtle bg-surface-raised/90 px-4 py-3 text-foreground shadow-sm backdrop-blur-2xl",
          className,
        )}
      >
        <div className="grid items-center gap-3 lg:grid-cols-[minmax(220px,1fr)_minmax(280px,520px)_minmax(300px,1fr)]">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1.5 text-xs font-bold text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <span key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                  {index > 0 ? <span className="text-border-strong">/</span> : null}
                  {crumb.href ? (
                    <Link href={crumb.href} className="truncate transition hover:text-primary">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="truncate">{crumb.label}</span>
                  )}
                </span>
              ))}
            </div>
            <h1 className="mt-1 truncate text-lg font-black tracking-tight text-foreground">{title}</h1>
          </div>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex h-11 min-w-0 items-center gap-3 rounded-md border border-border-subtle bg-surface px-3 text-left text-sm text-muted-foreground shadow-sm transition hover:-translate-y-px hover:border-primary/30 hover:bg-surface-muted hover:text-foreground"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate font-semibold">Search pages, jobs, engineers...</span>
            <span className="hidden rounded border border-border-subtle bg-surface-raised px-1.5 py-0.5 font-mono text-[11px] font-bold text-muted-foreground sm:inline">
              Ctrl K
            </span>
          </button>

          <div className="flex min-w-0 items-center justify-start gap-2 lg:justify-end">
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu(openMenu === "alerts" ? null : "alerts")}
                className="relative grid h-10 w-10 place-items-center rounded-md border border-border-subtle bg-surface text-muted-foreground shadow-sm transition hover:-translate-y-px hover:border-primary/30 hover:bg-primary-subtle hover:text-primary"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-danger px-1.5 py-0.5 text-center text-[10px] font-black text-danger-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </button>

              {openMenu === "alerts" ? (
                <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-md border border-border-subtle bg-surface shadow-lg">
                  <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-4 py-3">
                    <div>
                      <p className="text-sm font-black">Notifications</p>
                      <p className="text-xs text-muted-foreground">{unreadCount} unread alerts</p>
                    </div>
                    {notificationItems.length ? (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="rounded-md px-2 py-1 text-xs font-black text-primary transition hover:bg-primary-subtle"
                      >
                        Mark all read
                      </button>
                    ) : null}
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {notificationItems.length ? (
                      notificationItems.map((notification) => {
                        const Icon = notificationIcon[notification.type];

                        return (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() => {
                              if (notification.href) router.push(notification.href);
                              setOpenMenu(null);
                            }}
                            className="flex w-full gap-3 rounded-md px-3 py-2.5 text-left transition hover:bg-surface-muted"
                          >
                            <span
                              className={cn(
                                "grid h-9 w-9 shrink-0 place-items-center rounded-md border",
                                notificationTone[notification.type],
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-black leading-5 text-foreground">{notification.message}</span>
                              <span className="mt-1 block text-[11px] font-bold text-muted-foreground">
                                {timeAgo(notification.createdAt)}
                              </span>
                            </span>
                            {notification.unread ? (
                              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread notification" />
                            ) : null}
                          </button>
                        );
                      })
                    ) : (
                      <div className="grid place-items-center px-4 py-10 text-center">
                        <span className="grid h-11 w-11 place-items-center rounded-full border border-border-subtle bg-surface-muted text-muted-foreground">
                          <Bell className="h-5 w-5" />
                        </span>
                        <p className="mt-3 text-sm font-black text-foreground">You&apos;re all caught up</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          New applications, invoice changes, and verification events will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu(openMenu === "language" ? null : "language")}
                className="flex h-10 items-center gap-2 rounded-md border border-border-subtle bg-surface px-2.5 text-sm font-black text-muted-foreground shadow-sm transition hover:-translate-y-px hover:border-primary/30 hover:bg-primary-subtle hover:text-primary"
                aria-label="Choose language"
              >
                <span>{selectedLanguage.short}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {openMenu === "language" ? (
                <div className="absolute right-0 top-12 z-50 max-h-96 w-72 overflow-y-auto rounded-md border border-border-subtle bg-surface p-2 shadow-lg">
                  {LANGUAGES.map((language) => (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => chooseLanguage(language.code)}
                      className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition hover:bg-primary-subtle"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black text-foreground">{language.native}</span>
                        <span className="block text-xs text-muted-foreground">{language.label}</span>
                      </span>
                      {language.code === selectedLanguage.code ? <Check className="h-4 w-4 text-primary" /> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu(openMenu === "user" ? null : "user")}
                className="flex h-10 items-center gap-2 rounded-md border border-border-subtle bg-surface px-2 text-left shadow-sm transition hover:-translate-y-px hover:border-primary/30 hover:bg-surface-muted"
                aria-label="User menu"
              >
                {displayUser.avatar ? (
                  <Image
                    src={displayUser.avatar}
                    alt={displayUser.name}
                    width={28}
                    height={28}
                    placeholder="blur"
                    blurDataURL={avatarBlurDataUrl}
                    className="h-7 w-7 rounded-full border border-border-subtle object-cover"
                  />
                ) : (
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[10px] font-black text-on-primary">
                    {initials(displayUser.name)}
                  </span>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {openMenu === "user" ? (
                <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-md border border-border-subtle bg-surface shadow-lg">
                  <div className="border-b border-border-subtle p-4">
                    <div className="flex items-center gap-3">
                      {displayUser.avatar ? (
                        <Image
                          src={displayUser.avatar}
                          alt={displayUser.name}
                          width={44}
                          height={44}
                          placeholder="blur"
                          blurDataURL={avatarBlurDataUrl}
                          className="h-11 w-11 rounded-full border border-border-subtle object-cover"
                        />
                      ) : (
                        <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-xs font-black text-on-primary">
                          {initials(displayUser.name)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-foreground">{displayUser.name}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="rounded-full border border-primary/20 bg-primary-subtle px-2 py-0.5 text-[10px] font-black uppercase text-primary">
                            {roleLabel(displayUser.role)}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">{displayUser.city}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    {[
                      { label: "Profile", href: "/dashboard/profile", icon: UserRound },
                      { label: "Settings", href: "/dashboard/settings", icon: Settings },
                      { label: "Help", href: "/help", icon: CircleHelp },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold text-foreground transition hover:bg-surface-muted"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-bold text-danger transition hover:bg-danger-subtle"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <CommandPalette
        open={paletteOpen}
        items={commandItems}
        recentItems={paletteRecentItems}
        onClose={() => setPaletteOpen(false)}
      />
    </>
  );
}

export default Topbar;
