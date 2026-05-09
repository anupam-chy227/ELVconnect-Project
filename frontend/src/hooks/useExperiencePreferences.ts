"use client";

import { useEffect, useMemo, useState } from "react";
import {
  applyDocumentLanguage,
  getLanguageByCode,
  getSavedLocationPreference,
  getSavedLanguageCode,
  INDIA_LOCATIONS,
  LANGUAGE_CHANGE_EVENT,
  LOCATION_CHANGE_EVENT,
  LocationOption,
  translate,
} from "@/lib/experience-preferences";

export function useExperiencePreferences() {
  const [languageCode, setLanguageCode] = useState("en-IN");
  const [location, setLocation] = useState<LocationOption>(INDIA_LOCATIONS[0]);

  useEffect(() => {
    const sync = () => {
      const savedLanguage = getSavedLanguageCode();
      setLanguageCode(savedLanguage);
      setLocation(getSavedLocationPreference());
      applyDocumentLanguage(savedLanguage);
    };

    sync();
    window.addEventListener(LANGUAGE_CHANGE_EVENT, sync);
    window.addEventListener(LOCATION_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, sync);
      window.removeEventListener(LOCATION_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const language = useMemo(() => getLanguageByCode(languageCode), [languageCode]);

  return {
    language,
    languageCode,
    location,
    t: (key: Parameters<typeof translate>[1]) => translate(languageCode, key),
  };
}
