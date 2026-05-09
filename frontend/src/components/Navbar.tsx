"use client";

import type { FocusEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ClipboardList,
  Languages,
  LogIn,
  MapPin,
  Menu,
  Navigation,
  Search,
  Sparkles,
  UserPlus,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import ThemeLogo from "@/components/ThemeLogo";
import { markDashboardNavigationIntent } from "@/components/Dashboard/DashboardLandingGuard";
import { CommandPalette, type CommandPaletteItem } from "@/components/widgets/CommandPalette";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/components/ui/utils";
import {
  getLanguageByCode,
  getSavedLocationPreference,
  getSavedLanguageCode,
  INDIA_LOCATIONS,
  LANGUAGES,
  LANGUAGE_CHANGE_EVENT,
  LOCATION_CHANGE_EVENT,
  type LocationOption,
  setPreferredLocation,
  setPreferredLanguage,
  syncLocationToCurrentPath,
} from "@/lib/experience-preferences";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type LocationStatus = "idle" | "locating" | "connected" | "saved" | "denied" | "unsupported" | "error";

const primaryNavItems: NavItem[] = [
  { label: "Post a Job", href: "/post-requirement", icon: ClipboardList },
  { label: "Hire Engineers", href: "/engineers", icon: UsersRound },
];

const primaryNavButtonClass =
  "border-[#7779ff] bg-[#6366f1] text-white shadow-sm shadow-[#6366f1]/30 duration-200 ease-out hover:-translate-y-0.5 hover:border-[#6d70ff] hover:bg-[#5558e8] hover:text-white hover:shadow-md active:translate-y-0 active:scale-[0.98] active:bg-[#4f46e5] active:text-white";

const engineerNavButtonClass =
  "border-[#b0bf1a] bg-[#b0bf1a] text-slate-950 shadow-sm shadow-[#b0bf1a]/25 duration-200 ease-out hover:-translate-y-0.5 hover:border-[#c1cf25] hover:bg-[#c1cf25] hover:text-slate-950 hover:shadow-md active:translate-y-0 active:scale-[0.98] active:border-[#98a612] active:bg-[#98a612] active:text-slate-950";

const locationButtonClass =
  "border-white/85 bg-white text-slate-950 shadow-xs hover:border-white hover:bg-slate-50 hover:text-slate-950 dark:border-white/85 dark:bg-white dark:text-slate-950";

const commandItems: CommandPaletteItem[] = [
  {
    id: "post-requirement",
    label: "Post a Job",
    description: "Create a structured ELV requirement",
    href: "/post-requirement",
    type: "page",
    icon: <ClipboardList className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "find-work",
    label: "Find Work",
    description: "Browse open ELV jobs by city and category",
    href: "/jobs",
    type: "page",
    icon: <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "hire-engineers",
    label: "Hire Engineers",
    description: "Browse verified ELV specialists",
    href: "/engineers",
    type: "engineer",
    icon: <UsersRound className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "city-directory",
    label: "Connect Locations",
    description: "Review ELV coverage by Indian city",
    href: "/city-directory",
    type: "page",
    icon: <MapPin className="h-4 w-4" aria-hidden="true" />,
  },
];

function isActivePath(pathname: string | null, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || Boolean(pathname?.startsWith(`${href}/`));
}

function shouldHideNavbar(pathname: string | null) {
  if (!pathname) return false;
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname === "/login" ||
    pathname === "/register"
  );
}

function hasCoordinates(location: LocationOption) {
  return Number.isFinite(location.lat) && Number.isFinite(location.lng);
}

function getLocationStatus(location: LocationOption): LocationStatus {
  if (location.name === "Current Location" && hasCoordinates(location)) {
    return "connected";
  }

  if (location.name !== "All India") {
    return "saved";
  }

  return "idle";
}

function formatCoordinates(location: LocationOption) {
  if (!hasCoordinates(location)) return "";
  return `${location.lat?.toFixed(3)}, ${location.lng?.toFixed(3)}`;
}

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState<LocationOption>(INDIA_LOCATIONS[0]);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [languageCode, setLanguageCode] = useState(() => getSavedLanguageCode());
  const flyoutCloseTimerRef = useRef<number | null>(null);

  const selectedLanguage = getLanguageByCode(languageCode);

  const recentItems = useMemo(() => commandItems.slice(0, 3), []);

  useEffect(() => {
    return () => {
      if (flyoutCloseTimerRef.current) {
        window.clearTimeout(flyoutCloseTimerRef.current);
      }
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

  useEffect(() => {
    const syncLocation = () => {
      const savedLocation = getSavedLocationPreference();
      setLocation(savedLocation);
      setLocationStatus((current) => (current === "locating" ? current : getLocationStatus(savedLocation)));
      setLocationError(null);
    };

    syncLocation();
    window.addEventListener(LOCATION_CHANGE_EVENT, syncLocation);
    window.addEventListener("storage", syncLocation);

    return () => {
      window.removeEventListener(LOCATION_CHANGE_EVENT, syncLocation);
      window.removeEventListener("storage", syncLocation);
    };
  }, []);

  if (shouldHideNavbar(pathname)) {
    return null;
  }

  const closeMobile = () => {
    setMobileOpen(false);
    setSearchOpen(false);
    setLanguageOpen(false);
    setLocationOpen(false);
  };

  const clearFlyoutCloseTimer = () => {
    if (flyoutCloseTimerRef.current) {
      window.clearTimeout(flyoutCloseTimerRef.current);
      flyoutCloseTimerRef.current = null;
    }
  };

  const closeFlyouts = () => {
    clearFlyoutCloseTimer();
    setSearchOpen(false);
    setLanguageOpen(false);
    setLocationOpen(false);
  };

  const scheduleFlyoutClose = () => {
    clearFlyoutCloseTimer();
    flyoutCloseTimerRef.current = window.setTimeout(closeFlyouts, 160);
  };

  const handleFlyoutBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    scheduleFlyoutClose();
  };

  const openSearchOptions = () => {
    clearFlyoutCloseTimer();
    setSearchOpen(true);
    setLanguageOpen(false);
    setLocationOpen(false);
  };

  const toggleSearchOptions = () => {
    clearFlyoutCloseTimer();
    setSearchOpen((current) => {
      const next = !current;

      if (next) {
        setLanguageOpen(false);
        setLocationOpen(false);
      }

      return next;
    });
  };

  const openLanguageOptions = () => {
    clearFlyoutCloseTimer();
    setLanguageOpen(true);
    setSearchOpen(false);
    setLocationOpen(false);
  };

  const toggleLanguageOptions = () => {
    clearFlyoutCloseTimer();
    setLanguageOpen((current) => {
      const next = !current;

      if (next) {
        setSearchOpen(false);
        setLocationOpen(false);
      }

      return next;
    });
  };

  const openLocationOptions = () => {
    clearFlyoutCloseTimer();
    setLocationOpen(true);
    setSearchOpen(false);
    setLanguageOpen(false);
  };

  const chooseLanguage = (code: string) => {
    const language = getLanguageByCode(code);
    setLanguageCode(language.code);
    setPreferredLanguage(language.code);
    setLanguageOpen(false);
  };

  const chooseLocation = (value: LocationOption) => {
    setLocation(value);
    setLocationStatus(getLocationStatus(value));
    setLocationError(null);
    setPreferredLocation(value);
    syncLocationToCurrentPath(value);
    setLocationOpen(false);
  };

  const requestCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationStatus("unsupported");
      setLocationError("GPS location is not supported in this browser.");
      return;
    }

    setLocationStatus("locating");
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          name: "Current Location",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setLocation(currentLocation);
        setLocationStatus("connected");
        setPreferredLocation(currentLocation);
        syncLocationToCurrentPath(currentLocation);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus("denied");
          setLocationError("Location permission was denied. Allow location access from your browser to connect GPS.");
          return;
        }

        setLocationStatus("error");
        setLocationError(error.message || "Could not connect GPS location. Please try again.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  };

  const toggleLocationOptions = () => {
    clearFlyoutCloseTimer();
    setLocationOpen((current) => {
      const next = !current;

      if (next) {
        setSearchOpen(false);
        setLanguageOpen(false);
      }

      return next;
    });
  };

  const locationSummary =
    locationStatus === "locating"
      ? "Waiting for browser permission..."
      : locationStatus === "connected"
        ? `GPS connected${formatCoordinates(location) ? ` - ${formatCoordinates(location)}` : ""}`
        : locationStatus === "saved"
          ? `${location.name} selected`
          : locationStatus === "denied" || locationStatus === "unsupported" || locationStatus === "error"
            ? locationError || "GPS location could not be connected."
            : "Choose a saved region or connect current GPS.";

  const renderSearchPanel = (variant: "desktop" | "mobile") => (
    <div
      className={cn(
        "z-50 rounded-md border border-border-subtle bg-surface-raised p-2 text-left shadow-floating backdrop-blur-2xl",
        variant === "desktop" ? "absolute right-0 top-11 w-80" : "mt-2 w-full",
      )}
    >
      <div className="px-3 py-2">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Quick options</p>
        <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">Open jobs, engineers, and platform pages faster.</p>
      </div>
      <div className="grid gap-1">
        {commandItems.map((item) => (
          <Link
            key={item.id}
            href={item.href || "#"}
            onClick={() => {
              setSearchOpen(false);
              if (variant === "mobile") {
                closeMobile();
              }
            }}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-foreground transition hover:bg-primary-subtle hover:text-primary"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary-subtle text-primary">{item.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-black">{item.label}</span>
              {item.description ? <span className="block truncate text-xs font-semibold text-muted-foreground">{item.description}</span> : null}
            </span>
          </Link>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          setSearchOpen(false);
          setCommandOpen(true);
          if (variant === "mobile") {
            setMobileOpen(false);
          }
        }}
        className="mt-2 flex min-h-10 w-full items-center justify-between gap-3 rounded-md border border-primary/20 bg-primary px-3 text-sm font-black text-on-primary shadow-sm shadow-primary/20 transition hover:bg-primary-container"
      >
        <span>Open full search</span>
        <span className="rounded border border-white/25 bg-white/15 px-1.5 py-0.5 font-mono text-[10px]">Ctrl K</span>
      </button>
    </div>
  );

  const renderLanguagePanel = (variant: "desktop" | "mobile") => (
    <div
      data-no-translate
      className={cn(
        "z-50 max-h-80 overflow-auto rounded-md border border-border-subtle bg-surface-raised p-2 text-left shadow-floating backdrop-blur-2xl",
        variant === "desktop" ? "absolute right-0 top-11 w-72" : "mt-2 w-full",
      )}
    >
      {LANGUAGES.map((language) => {
        const selected = selectedLanguage.code === language.code;

        return (
          <button
            key={language.code}
            type="button"
            onClick={() => chooseLanguage(language.code)}
            className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm text-foreground transition hover:bg-primary-subtle hover:text-primary"
          >
            <span className="min-w-0">
              <span className="block truncate font-black">{language.native}</span>
              <span className="block truncate text-xs font-semibold text-muted-foreground">{language.label}</span>
            </span>
            {selected ? <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> : null}
          </button>
        );
      })}
    </div>
  );

  const renderLocationPanel = (variant: "desktop" | "mobile") => (
    <div
      className={cn(
        "z-50 rounded-md border border-border-subtle bg-surface-raised p-2 text-left shadow-floating backdrop-blur-2xl",
        variant === "desktop" ? "absolute right-0 top-11 w-80" : "mt-2 w-full",
      )}
    >
      <div className="rounded-md border border-primary/10 bg-primary-subtle/70 p-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-primary shadow-xs">
            <MapPin className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-black text-foreground">Location</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground" aria-live="polite">
              {locationSummary}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={requestCurrentLocation}
          disabled={locationStatus === "locating"}
          className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-black text-on-primary shadow-sm shadow-primary/20 transition hover:bg-primary-container disabled:cursor-wait disabled:opacity-70"
        >
          <Navigation className={cn("h-4 w-4", locationStatus === "locating" && "animate-pulse")} aria-hidden="true" />
          {locationStatus === "locating" ? "Connecting GPS..." : "Connect current GPS"}
        </button>
      </div>

      <div className="mt-2 max-h-64 overflow-auto pr-1">
        {INDIA_LOCATIONS.map((item) => {
          const selected = location.name === item.name;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => chooseLocation(item)}
              className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold text-foreground transition hover:bg-primary-subtle"
            >
              <span className="truncate">{item.name}</span>
              {selected ? <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[linear-gradient(135deg,#080b16_0%,#111827_48%,#1e1b4b_100%)] shadow-sm shadow-black/30 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-20 max-w-[1600px] items-center gap-3 px-2 sm:px-3 lg:px-4">
          <Link
            href="/"
            data-no-translate
            className="flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
            aria-label="ELV Verse home"
            onClick={closeMobile}
          >
            <span className="flex h-[66px] w-[260px] items-center overflow-hidden rounded-md bg-transparent px-0 py-0 drop-shadow-[0_0_18px_rgba(12,170,246,0.22)] sm:w-[320px] xl:w-[370px]">
              <ThemeLogo className="h-full w-full object-contain" priority sizes="(min-width: 1280px) 370px, (min-width: 640px) 320px, 260px" />
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center gap-1.5 xl:flex">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border px-3 text-xs font-black transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring",
                    item.href === "/engineers" ? engineerNavButtonClass : primaryNavButtonClass,
                    active && "ring-2 ring-white/45",
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", item.href === "/engineers" ? "text-slate-950" : "text-white")} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="ml-auto hidden items-center gap-1 xl:flex">
            <div className="relative" onMouseEnter={openSearchOptions} onMouseLeave={scheduleFlyoutClose} onFocus={openSearchOptions} onBlur={handleFlyoutBlur}>
              <button
                type="button"
                onClick={toggleSearchOptions}
                className="inline-flex h-9 w-[220px] items-center gap-2 rounded-md border border-primary/15 bg-white px-3 text-left text-xs font-bold text-muted-foreground shadow-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/35 hover:text-foreground active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring 2xl:w-[280px] dark:border-primary/25 dark:bg-slate-900 dark:text-slate-300"
                aria-haspopup="menu"
                aria-expanded={searchOpen}
              >
                <Search className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">Search</span>
                <span className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 2xl:inline-flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Ctrl K
                </span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              </button>
              {searchOpen ? renderSearchPanel("desktop") : null}
            </div>

            <div data-no-translate className="relative" onMouseEnter={openLanguageOptions} onMouseLeave={scheduleFlyoutClose} onFocus={openLanguageOptions} onBlur={handleFlyoutBlur}>
              <button
                type="button"
                onClick={toggleLanguageOptions}
                className="inline-flex h-9 w-[210px] items-center gap-1.5 rounded-md border border-primary/15 bg-white px-2.5 text-left text-xs font-black text-slate-700 shadow-xs transition hover:-translate-y-0.5 hover:border-primary/35 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring dark:border-primary/25 dark:bg-slate-900 dark:text-slate-200 2xl:w-[240px]"
                aria-haspopup="menu"
                aria-expanded={languageOpen}
                aria-label="Select language"
              >
                <Languages className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">
                  {selectedLanguage.label} - {selectedLanguage.native}
                </span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              </button>
              {languageOpen ? renderLanguagePanel("desktop") : null}
            </div>

            <div className="relative" onMouseEnter={openLocationOptions} onMouseLeave={scheduleFlyoutClose} onFocus={openLocationOptions} onBlur={handleFlyoutBlur}>
              <button
                type="button"
                onClick={toggleLocationOptions}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-xs font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring",
                  locationButtonClass,
                  locationStatus === "connected" && "ring-2 ring-emerald-400/55",
                )}
                aria-haspopup="dialog"
                aria-expanded={locationOpen}
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                Location
                <ChevronDown className="h-3 w-3" aria-hidden="true" />
              </button>
              {locationOpen ? renderLocationPanel("desktop") : null}
            </div>

            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={markDashboardNavigationIntent}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-black text-on-primary shadow-sm shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-container focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border border-[#b0bf1a] bg-[#b0bf1a] px-3 text-xs font-black text-slate-950 shadow-sm shadow-[#b0bf1a]/25 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#c1cf25] hover:bg-[#c1cf25] active:translate-y-0 active:scale-[0.98] active:border-[#98a612] active:bg-[#98a612] active:text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
                >
                  <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border border-[#bf3eff] bg-[#bf3eff] px-3 text-xs font-black text-slate-950 shadow-sm shadow-[#bf3eff]/30 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#cf66ff] hover:bg-[#cf66ff] active:translate-y-0 active:scale-[0.98] active:border-[#a827ea] active:bg-[#a827ea] active:text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
                >
                  <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md border border-primary/15 bg-white text-slate-700 shadow-xs transition hover:border-primary/35 hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring xl:hidden dark:border-primary/25 dark:bg-slate-900 dark:text-slate-200"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-controls="mobile-navbar-menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((current) => !current)}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

        {mobileOpen ? (
          <div id="mobile-navbar-menu" className="border-t border-white/10 bg-[linear-gradient(135deg,#080b16_0%,#111827_48%,#1e1b4b_100%)] px-3 py-3 shadow-md backdrop-blur-2xl xl:hidden">
            <div className="mx-auto grid max-w-[1500px] gap-2">
              <div className="relative" onMouseEnter={openSearchOptions} onMouseLeave={scheduleFlyoutClose} onFocus={openSearchOptions} onBlur={handleFlyoutBlur}>
                <button
                  type="button"
                  onClick={toggleSearchOptions}
                  className="flex min-h-11 w-full items-center gap-2 rounded-md border border-border-subtle bg-surface px-3 text-sm font-black text-foreground shadow-xs"
                  aria-haspopup="menu"
                  aria-expanded={searchOpen}
                >
                  <Search className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-left">Search pages, jobs, engineers</span>
                  <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">Ctrl K</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </button>
                {searchOpen ? renderSearchPanel("mobile") : null}
              </div>

              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    className={cn(
                      "flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm font-black transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring",
                      item.href === "/engineers" ? engineerNavButtonClass : primaryNavButtonClass,
                    )}
                  >
                    <Icon className={cn("h-4 w-4", item.href === "/engineers" ? "text-slate-950" : "text-white")} aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/jobs"
                onClick={closeMobile}
                className="flex min-h-11 items-center gap-2 rounded-md border border-border-subtle bg-surface px-3 text-sm font-black text-foreground shadow-xs transition hover:border-primary/30 hover:bg-primary-subtle hover:text-primary"
              >
                <BriefcaseBusiness className="h-4 w-4 text-primary" aria-hidden="true" />
                Find Work
              </Link>

              <div className="relative" onMouseEnter={openLocationOptions} onMouseLeave={scheduleFlyoutClose} onFocus={openLocationOptions} onBlur={handleFlyoutBlur}>
                <button
                  type="button"
                  onClick={toggleLocationOptions}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-2 rounded-md border px-3 text-sm font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring",
                    locationButtonClass,
                    locationStatus === "connected" && "ring-2 ring-emerald-400/55",
                  )}
                  aria-haspopup="dialog"
                  aria-expanded={locationOpen}
                >
                  <MapPin className="h-4 w-4 text-slate-950" aria-hidden="true" />
                  Location
                  <ChevronDown className="ml-auto h-4 w-4 text-slate-700" aria-hidden="true" />
                </button>
                {locationOpen ? renderLocationPanel("mobile") : null}
              </div>

              <div data-no-translate className="relative" onMouseEnter={openLanguageOptions} onMouseLeave={scheduleFlyoutClose} onFocus={openLanguageOptions} onBlur={handleFlyoutBlur}>
                <button
                  type="button"
                  onClick={toggleLanguageOptions}
                  className="flex min-h-11 w-full items-center gap-2 rounded-md border border-border-subtle bg-surface px-3 text-sm font-black text-foreground shadow-xs"
                  aria-haspopup="menu"
                  aria-expanded={languageOpen}
                  aria-label="Select language"
                >
                  <Languages className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-left">
                    {selectedLanguage.label} - {selectedLanguage.native}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </button>
                {languageOpen ? renderLanguagePanel("mobile") : null}
              </div>

              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  onClick={() => {
                    markDashboardNavigationIntent();
                    closeMobile();
                  }}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-black text-on-primary shadow-sm shadow-primary/20"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Dashboard
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={closeMobile}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#b0bf1a] bg-[#b0bf1a] px-4 text-sm font-black text-slate-950 shadow-sm shadow-[#b0bf1a]/25 transition-all duration-200 ease-out active:scale-[0.98] active:border-[#98a612] active:bg-[#98a612] active:text-slate-950"
                  >
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobile}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#bf3eff] bg-[#bf3eff] px-4 text-sm font-black text-slate-950 shadow-sm shadow-[#bf3eff]/30 transition-all duration-200 ease-out active:scale-[0.98] active:border-[#a827ea] active:bg-[#a827ea] active:text-slate-950"
                  >
                    <UserPlus className="h-4 w-4" aria-hidden="true" />
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </nav>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} items={commandItems} recentItems={recentItems} />
    </>
  );
}
