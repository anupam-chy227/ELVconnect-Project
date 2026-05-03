"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getLocationByName,
  INDIA_LOCATIONS,
  LANGUAGES,
  LocationOption,
  STORAGE_KEYS,
  translate,
} from "@/lib/experience-preferences";

export function useExperiencePreferences() {
  const [languageCode, setLanguageCode] = useState("en-IN");
  const [location, setLocation] = useState<LocationOption>(INDIA_LOCATIONS[0]);

  useEffect(() => {
    const sync = () => {
      const savedLanguage = localStorage.getItem(STORAGE_KEYS.language) || "en-IN";
      const savedLocation = localStorage.getItem(STORAGE_KEYS.location) || "All India";
      const savedLat = Number(localStorage.getItem("elv-location-lat"));
      const savedLng = Number(localStorage.getItem("elv-location-lng"));
      setLanguageCode(savedLanguage);
      setLocation(
        savedLocation === "Current Location" && savedLat && savedLng
          ? { name: "Current Location", lat: savedLat, lng: savedLng }
          : getLocationByName(savedLocation)
      );
      document.documentElement.lang = savedLanguage;
    };

    sync();
    window.addEventListener("elv-language-change", sync);
    window.addEventListener("elv-location-change", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("elv-language-change", sync);
      window.removeEventListener("elv-location-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const language = useMemo(
    () => LANGUAGES.find((item) => item.code === languageCode) || LANGUAGES[0],
    [languageCode]
  );

  return {
    language,
    languageCode,
    location,
    t: (key: Parameters<typeof translate>[1]) => translate(languageCode, key),
  };
}
