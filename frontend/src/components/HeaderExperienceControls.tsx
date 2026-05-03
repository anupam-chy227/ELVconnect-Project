"use client";

import { useEffect, useState } from "react";
import { Bell, Check, ChevronDown, Languages, MapPin, Navigation } from "lucide-react";
import {
  getLocationByName,
  INDIA_LOCATIONS,
  LANGUAGES,
  LocationOption,
  STORAGE_KEYS,
} from "@/lib/experience-preferences";

function getSavedLanguage() {
  if (typeof window === "undefined") return "en-IN";
  return localStorage.getItem(STORAGE_KEYS.language) || "en-IN";
}

function getSavedLocation() {
  if (typeof window === "undefined") return INDIA_LOCATIONS[0];
  const savedLocation = localStorage.getItem(STORAGE_KEYS.location) || "All India";
  const savedLat = Number(localStorage.getItem("elv-location-lat"));
  const savedLng = Number(localStorage.getItem("elv-location-lng"));
  return savedLocation === "Current Location" && savedLat && savedLng
    ? { name: "Current Location", lat: savedLat, lng: savedLng }
    : getLocationByName(savedLocation);
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

  const language = LANGUAGES.find((item) => item.code === languageCode) || LANGUAGES[0];

  useEffect(() => {
    document.documentElement.lang = languageCode;
  }, [languageCode]);

  useEffect(() => {
    let isMounted = true;

    queueMicrotask(() => {
      if (!isMounted) return;

      setLanguageCode(getSavedLanguage());
      setLocation(getSavedLocation());
      setNotificationStatus(getNotificationStatus());
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const chooseLanguage = (code: string) => {
    setLanguageCode(code);
    document.documentElement.lang = code;
    localStorage.setItem(STORAGE_KEYS.language, code);
    window.dispatchEvent(new Event("elv-language-change"));
    setOpenPanel(null);
  };

  const chooseLocation = (value: LocationOption) => {
    setLocation(value);
    localStorage.setItem(STORAGE_KEYS.location, value.name);
    if (value.lat && value.lng) {
      localStorage.setItem("elv-location-lat", String(value.lat));
      localStorage.setItem("elv-location-lng", String(value.lng));
    } else {
      localStorage.removeItem("elv-location-lat");
      localStorage.removeItem("elv-location-lng");
    }
    window.dispatchEvent(new Event("elv-location-change"));
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
    <div className="relative flex items-center gap-2">
      <div className="relative">
        <button
          type="button"
          title="Choose language"
          onClick={() => setOpenPanel(openPanel === "language" ? null : "language")}
          className="flex h-10 items-center gap-2 rounded-md border border-border-subtle bg-surface-raised px-3 text-sm font-semibold text-muted-foreground shadow-sm backdrop-blur-xl transition hover:border-primary/35 hover:text-primary"
        >
          <Languages className="h-4 w-4" />
          <span className="hidden lg:inline">{language.native}</span>
          <ChevronDown className="h-3.5 w-3.5" />
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
          className="flex h-10 items-center gap-2 rounded-md border border-primary/20 bg-primary-subtle px-3 text-sm font-black text-primary shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-white hover:shadow-md dark:hover:bg-slate-900"
          aria-haspopup="dialog"
          aria-expanded={openPanel === "location"}
        >
          <MapPin className="h-4 w-4" />
          <span className="hidden max-w-36 truncate sm:inline">{location.name}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        {openPanel === "location" && (
          <div className="absolute right-0 top-12 z-50 max-h-96 w-80 overflow-auto rounded-md border border-border-subtle bg-surface-raised p-2 shadow-floating backdrop-blur-2xl">
            <button
              type="button"
              onClick={useCurrentLocation}
              className="mb-2 flex w-full items-center gap-2 rounded-md bg-gradient-to-b from-primary to-primary-container px-3 py-2 text-sm font-semibold text-on-primary shadow-sm hover:opacity-90"
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
          className="relative flex h-10 w-10 items-center justify-center rounded-md border border-border-subtle bg-surface-raised text-muted-foreground shadow-sm backdrop-blur-xl transition hover:border-primary/35 hover:text-primary"
        >
          <Bell className="h-4 w-4" />
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
              className="mt-4 w-full rounded-md bg-gradient-to-b from-primary to-primary-container px-3 py-2 text-sm font-semibold text-on-primary shadow-sm hover:opacity-90 disabled:opacity-60"
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
