"use client";

import { useEffect, useState } from "react";

const LOCATION_STORAGE_KEY = "elv_user_location";
const LOCATION_TTL_MS = 24 * 60 * 60 * 1000;

export type GeolocationState = {
  lat: number | null;
  lng: number | null;
  city: string;
  isLoading: boolean;
  error: string | null;
  permissionDenied: boolean;
};

type StoredLocation = {
  lat: number;
  lng: number;
  city: string;
  savedAt: number;
};

function readStoredLocation(): StoredLocation | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredLocation>;
    if (
      typeof parsed.lat !== "number" ||
      typeof parsed.lng !== "number" ||
      typeof parsed.savedAt !== "number" ||
      Date.now() - parsed.savedAt > LOCATION_TTL_MS
    ) {
      return null;
    }

    return {
      lat: parsed.lat,
      lng: parsed.lng,
      city: typeof parsed.city === "string" ? parsed.city : "",
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

function saveLocation(location: StoredLocation) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
}

export function useGeolocation(fallbackCity = ""): GeolocationState {
  const [state, setState] = useState<GeolocationState>(() => {
    const stored = readStoredLocation();

    if (stored) {
      return {
        lat: stored.lat,
        lng: stored.lng,
        city: stored.city || fallbackCity,
        isLoading: false,
        error: null,
        permissionDenied: false,
      };
    }

    return {
      lat: null,
      lng: null,
      city: fallbackCity,
      isLoading: typeof navigator !== "undefined" && Boolean(navigator.geolocation),
      error: null,
      permissionDenied: false,
    };
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      const timeout = window.setTimeout(() => {
        setState({
          lat: null,
          lng: null,
          city: fallbackCity,
          isLoading: false,
          error: "Geolocation is not supported by this browser.",
          permissionDenied: false,
        });
      }, 0);
      return () => window.clearTimeout(timeout);
    }

    let mounted = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!mounted) return;

        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          city: fallbackCity,
          savedAt: Date.now(),
        };
        saveLocation(location);

        setState({
          lat: location.lat,
          lng: location.lng,
          city: fallbackCity,
          isLoading: false,
          error: null,
          permissionDenied: false,
        });
      },
      (geoError) => {
        if (!mounted) return;

        setState({
          lat: null,
          lng: null,
          city: fallbackCity,
          isLoading: false,
          error: geoError.message,
          permissionDenied: geoError.code === geoError.PERMISSION_DENIED,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: LOCATION_TTL_MS,
      },
    );

    return () => {
      mounted = false;
    };
  }, [fallbackCity]);

  return state;
}
