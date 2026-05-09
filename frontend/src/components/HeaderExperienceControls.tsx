"use client";

import { useEffect, useState } from "react";
import { Bell, Check, ChevronDown, Languages, MapPin, Navigation } from "lucide-react";
import {
  applyDocumentLanguage,
  getLanguageByCode,
  getSavedLocationPreference,
  getSavedLanguageCode,
  INDIA_LOCATIONS,
  LANGUAGES,
  LANGUAGE_CHANGE_EVENT,
  LocationOption,
  setPreferredLocation,
  setPreferredLanguage,
  syncLocationToCurrentPath,
  STORAGE_KEYS,
} from "@/lib/experience-preferences";

function getSavedLanguage() {
  return getSavedLanguageCode();
}

function getNotificationStatus(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined") return "default";
  return "Notification" in window ? Notification.permission : "unsupported";
}

export default function HeaderExperienceControls() {
  const [openPanel, setOpenPanel] = useState<"language" | "location" | "notification" | null>(null);
  const [languageCode, setLanguageCode] = useState("en-IN");
  const [location, setLocation] = useState<LocationOption>(INDIA_LOCATIONS[0]);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission | "unsupported">("default");
  const [isLocating, setIsLocating] = useState(false);

  const language = getLanguageByCode(languageCode);

  useEffect(() => {
    applyDocumentLanguage(languageCode);
  }, [languageCode]);

  useEffect(() => {
    let isMounted = true;

    queueMicrotask(() => {
      if (!isMounted) return;

      setLanguageCode(getSavedLanguage());
      setLocation(getSavedLocationPreference());
      setNotificationStatus(getNotificationStatus());
    });

    const syncLanguage = () => setLanguageCode(getSavedLanguage());
    window.addEventListener(LANGUAGE_CHANGE_EVENT, syncLanguage);
    window.addEventListener("storage", syncLanguage);

    return () => {
      isMounted = false;
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, syncLanguage);
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  const chooseLanguage = (code: string) => {
    const language = getLanguageByCode(code);
    setLanguageCode(language.code);
    setPreferredLanguage(language.code);
    setOpenPanel(null);
  };

  const chooseLocation = (value: LocationOption) => {
    setLocation(value);
    setPreferredLocation(value);
    syncLocationToCurrentPath(value);
    setOpenPanel(null);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const current = {
          name: "Current Location",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        chooseLocation(current);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      setNotificationStatus("unsupported");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
    localStorage.setItem(STORAGE_KEYS.notifications, permission === "granted" ? "true" : "false");

    if (permission === "granted") {
      new Notification("ELV Connect notifications enabled", {
        body: "You will receive updates for jobs, applications, invoices, and account activity.",
      });
    }
  };

  return (
    <div className="relative flex items-center gap-1.5">
      <div className="relative">
        <button
          type="button"
          title="Choose language"
          onClick={() => setOpenPanel(openPanel === "language" ? null : "language")}
          className="flex h-9 items-center gap-1.5 rounded-md border border-border-subtle bg-surface-raised px-2.5 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur-xl transition hover:border-primary/35 hover:text-primary"
        >
          <Languages className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">{language.native}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
        {openPanel === "language" && (
          <div className="absolute right-0 top-12 z-50 max-h-80 w-72 overflow-auto rounded-md border border-border-subtle bg-surface-raised p-2 shadow-floating backdrop-blur-2xl">
            {LANGUAGES.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => chooseLanguage(item.code)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-primary-subtle"
              >
                <span>
                  <span className="font-semibold">{item.native}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{item.label}</span>
                </span>
                {language.code === item.code && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          title="Choose location"
          onClick={() => setOpenPanel(openPanel === "location" ? null : "location")}
          className="flex h-9 items-center gap-1.5 rounded-md border border-primary/20 bg-primary-subtle px-2.5 text-xs font-black text-primary shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-white hover:shadow-md dark:hover:bg-slate-900"
          aria-haspopup="dialog"
          aria-expanded={openPanel === "location"}
        >
          <MapPin className="h-3.5 w-3.5" />
          <span className="hidden max-w-28 truncate sm:inline">{location.name}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
        {openPanel === "location" && (
          <div className="absolute right-0 top-12 z-50 max-h-96 w-80 overflow-auto rounded-md border border-border-subtle bg-surface-raised p-2 shadow-floating backdrop-blur-2xl">
            <button
              type="button"
              onClick={useCurrentLocation}
              className="mb-2 flex w-full items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-on-primary shadow-sm shadow-primary/20 hover:bg-primary-container"
            >
              <Navigation className="h-4 w-4" />
              {isLocating ? "Finding location..." : "Use current GPS location"}
            </button>
            {INDIA_LOCATIONS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => chooseLocation(item)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-primary-subtle"
              >
                {item.name}
                {location.name === item.name && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          title="Notifications"
          onClick={() => setOpenPanel(openPanel === "notification" ? null : "notification")}
          className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border-subtle bg-surface-raised text-muted-foreground shadow-sm backdrop-blur-xl transition hover:border-primary/35 hover:text-primary"
        >
          <Bell className="h-3.5 w-3.5" />
          {notificationStatus === "granted" && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500" />
          )}
        </button>
        {openPanel === "notification" && (
          <div className="absolute right-0 top-12 z-50 w-72 rounded-md border border-border-subtle bg-surface-raised p-4 shadow-floating backdrop-blur-2xl">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Get alerts for new jobs, applications, invoices, and account activity.
            </p>
            <button
              type="button"
              onClick={enableNotifications}
              className="mt-4 w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-on-primary shadow-sm shadow-primary/20 hover:bg-primary-container disabled:opacity-60"
              disabled={notificationStatus === "unsupported"}
            >
              {notificationStatus === "granted" ? "Send test notification" : "Enable notifications"}
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              Status: {notificationStatus === "unsupported" ? "Not supported" : notificationStatus}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
