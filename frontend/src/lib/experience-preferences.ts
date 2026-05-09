export type LanguageOption = {
  code: string;
  label: string;
  native: string;
  short: string;
  dir: "ltr" | "rtl";
  translateCode: string;
};

export type LocationOption = {
  name: string;
  lat?: number;
  lng?: number;
};

export const STORAGE_KEYS = {
  language: "elv-preferred-language",
  location: "elv-preferred-location",
  locationLat: "elv-location-lat",
  locationLng: "elv-location-lng",
  notifications: "elv-notifications-enabled",
};

export const LANGUAGE_CHANGE_EVENT = "elv-language-change";
export const LOCATION_CHANGE_EVENT = "elv-location-change";

export const LANGUAGES: LanguageOption[] = [
  { code: "en-IN", label: "English", native: "English", short: "EN", dir: "ltr", translateCode: "en" },
  { code: "hi-IN", label: "Hindi", native: "\u0939\u093f\u0928\u094d\u0926\u0940", short: "HI", dir: "ltr", translateCode: "hi" },
  { code: "bn-IN", label: "Bengali", native: "\u09ac\u09be\u0982\u09b2\u09be", short: "BN", dir: "ltr", translateCode: "bn" },
  { code: "te-IN", label: "Telugu", native: "\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41", short: "TE", dir: "ltr", translateCode: "te" },
  { code: "mr-IN", label: "Marathi", native: "\u092e\u0930\u093e\u0920\u0940", short: "MR", dir: "ltr", translateCode: "mr" },
  { code: "ta-IN", label: "Tamil", native: "\u0ba4\u0bae\u0bbf\u0bb4\u0bcd", short: "TA", dir: "ltr", translateCode: "ta" },
  { code: "ur-IN", label: "Urdu", native: "\u0627\u0631\u062f\u0648", short: "UR", dir: "rtl", translateCode: "ur" },
  { code: "gu-IN", label: "Gujarati", native: "\u0a97\u0ac1\u0a9c\u0ab0\u0abe\u0aa4\u0ac0", short: "GU", dir: "ltr", translateCode: "gu" },
  { code: "kn-IN", label: "Kannada", native: "\u0c95\u0ca8\u0ccd\u0ca8\u0ca1", short: "KN", dir: "ltr", translateCode: "kn" },
  { code: "ml-IN", label: "Malayalam", native: "\u0d2e\u0d32\u0d2f\u0d3e\u0d33\u0d02", short: "ML", dir: "ltr", translateCode: "ml" },
  { code: "pa-IN", label: "Punjabi", native: "\u0a2a\u0a70\u0a1c\u0a3e\u0a2c\u0a40", short: "PA", dir: "ltr", translateCode: "pa" },
];

export function getLanguageByCode(code: string | null | undefined) {
  return LANGUAGES.find((language) => language.code === code) || LANGUAGES[0];
}

export function getSavedLanguageCode() {
  if (typeof window === "undefined") return LANGUAGES[0].code;
  return getLanguageByCode(localStorage.getItem(STORAGE_KEYS.language)).code;
}

export function applyDocumentLanguage(code: string) {
  if (typeof document === "undefined") return;
  const language = getLanguageByCode(code);
  document.documentElement.lang = language.code;
  document.documentElement.dir = language.dir;
}

export function setPreferredLanguage(code: string) {
  if (typeof window === "undefined") return;
  const language = getLanguageByCode(code);
  localStorage.setItem(STORAGE_KEYS.language, language.code);
  applyDocumentLanguage(language.code);
  window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
}

export const INDIA_LOCATIONS: LocationOption[] = [
  { name: "All India", lat: 22.9734, lng: 78.6569 },
  { name: "Andhra Pradesh", lat: 15.9129, lng: 79.74 },
  { name: "Arunachal Pradesh", lat: 28.218, lng: 94.7278 },
  { name: "Assam", lat: 26.2006, lng: 92.9376 },
  { name: "Bihar", lat: 25.0961, lng: 85.3131 },
  { name: "Chhattisgarh", lat: 21.2787, lng: 81.8661 },
  { name: "Delhi NCR", lat: 28.6139, lng: 77.209 },
  { name: "Goa", lat: 15.2993, lng: 74.124 },
  { name: "Gujarat", lat: 22.2587, lng: 71.1924 },
  { name: "Haryana", lat: 29.0588, lng: 76.0856 },
  { name: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },
  { name: "Jharkhand", lat: 23.6102, lng: 85.2799 },
  { name: "Karnataka", lat: 15.3173, lng: 75.7139 },
  { name: "Kerala", lat: 10.8505, lng: 76.2711 },
  { name: "Madhya Pradesh", lat: 22.9734, lng: 78.6569 },
  { name: "Maharashtra", lat: 19.7515, lng: 75.7139 },
  { name: "Manipur", lat: 24.6637, lng: 93.9063 },
  { name: "Meghalaya", lat: 25.467, lng: 91.3662 },
  { name: "Mizoram", lat: 23.1645, lng: 92.9376 },
  { name: "Nagaland", lat: 26.1584, lng: 94.5624 },
  { name: "Odisha", lat: 20.9517, lng: 85.0985 },
  { name: "Punjab", lat: 31.1471, lng: 75.3412 },
  { name: "Rajasthan", lat: 27.0238, lng: 74.2179 },
  { name: "Sikkim", lat: 27.533, lng: 88.5122 },
  { name: "Tamil Nadu", lat: 11.1271, lng: 78.6569 },
  { name: "Telangana", lat: 18.1124, lng: 79.0193 },
  { name: "Tripura", lat: 23.9408, lng: 91.9882 },
  { name: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { name: "Uttarakhand", lat: 30.0668, lng: 79.0193 },
  { name: "West Bengal", lat: 22.9868, lng: 87.855 },
  { name: "Andaman and Nicobar Islands", lat: 11.7401, lng: 92.6586 },
  { name: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { name: "Dadra and Nagar Haveli and Daman and Diu", lat: 20.3974, lng: 72.8328 },
  { name: "Jammu and Kashmir", lat: 33.7782, lng: 76.5762 },
  { name: "Ladakh", lat: 34.2268, lng: 77.5619 },
  { name: "Lakshadweep", lat: 10.5667, lng: 72.6417 },
  { name: "Puducherry", lat: 11.9416, lng: 79.8083 },
];

export const getLocationByName = (name: string) =>
  INDIA_LOCATIONS.find((location) => location.name === name) || INDIA_LOCATIONS[0];

export function getSavedLocationPreference() {
  if (typeof window === "undefined") return INDIA_LOCATIONS[0];

  const savedLocation = localStorage.getItem(STORAGE_KEYS.location) || "All India";
  const savedLat = Number(localStorage.getItem(STORAGE_KEYS.locationLat));
  const savedLng = Number(localStorage.getItem(STORAGE_KEYS.locationLng));

  if (savedLocation === "Current Location" && Number.isFinite(savedLat) && Number.isFinite(savedLng)) {
    return { name: "Current Location", lat: savedLat, lng: savedLng };
  }

  return getLocationByName(savedLocation);
}

export function setPreferredLocation(location: LocationOption) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEYS.location, location.name);

  if (Number.isFinite(location.lat) && Number.isFinite(location.lng)) {
    localStorage.setItem(STORAGE_KEYS.locationLat, String(location.lat));
    localStorage.setItem(STORAGE_KEYS.locationLng, String(location.lng));
  } else {
    localStorage.removeItem(STORAGE_KEYS.locationLat);
    localStorage.removeItem(STORAGE_KEYS.locationLng);
  }

  window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
}

export const LOCATION_SEARCH_KEYS = ["city", "lat", "lng", "radius"] as const;

const LOCATION_ALIASES: Record<string, string[]> = {
  "Delhi NCR": ["Delhi NCR", "Delhi", "New Delhi", "Gurugram", "Gurgaon", "Noida", "Faridabad", "Ghaziabad", "Manesar"],
  Maharashtra: ["Maharashtra", "Mumbai", "Pune", "Navi Mumbai", "Thane", "Nagpur", "Chakan"],
  Karnataka: ["Karnataka", "Bengaluru", "Bangalore", "Mysuru"],
  Telangana: ["Telangana", "Hyderabad", "Secunderabad"],
  Gujarat: ["Gujarat", "Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "Tamil Nadu": ["Tamil Nadu", "Chennai", "Coimbatore", "Madurai"],
  "West Bengal": ["West Bengal", "Kolkata", "Howrah"],
};

export function getLocationAliases(locationName: string) {
  return LOCATION_ALIASES[locationName] || [locationName];
}

export function isAllIndiaLocation(location: Pick<LocationOption, "name">) {
  return location.name === "All India";
}

export function getLocationSearchParams(location: LocationOption, radiusKm = 100) {
  const params = new URLSearchParams();

  if (isAllIndiaLocation(location)) {
    return params;
  }

  if (location.name === "Current Location" && Number.isFinite(location.lat) && Number.isFinite(location.lng)) {
    params.set("lat", String(location.lat));
    params.set("lng", String(location.lng));
    params.set("radius", String(radiusKm));
    return params;
  }

  params.set("city", location.name);
  return params;
}

export function appendLocationSearchParams(baseUrl: string, location: LocationOption, radiusKm = 100) {
  const params = getLocationSearchParams(location, radiusKm);
  const query = params.toString();

  if (!query) {
    return baseUrl;
  }

  return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${query}`;
}

export function mergeLocationSearchParams(search: string | URLSearchParams, location: LocationOption, radiusKm = 100) {
  const params = new URLSearchParams(search);

  LOCATION_SEARCH_KEYS.forEach((key) => params.delete(key));
  getLocationSearchParams(location, radiusKm).forEach((value, key) => params.set(key, value));

  return params;
}

export function syncLocationToCurrentPath(location: LocationOption) {
  if (typeof window === "undefined" || !shouldSyncLocationToPath(window.location.pathname)) {
    return;
  }

  const params = mergeLocationSearchParams(window.location.search, location);
  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", nextUrl);
}

export function shouldSyncLocationToPath(pathname: string) {
  return (
    pathname === "/jobs" ||
    pathname === "/engineers" ||
    pathname === "/matches" ||
    pathname === "/city-directory" ||
    pathname.startsWith("/categories/")
  );
}

export function locationMatchesPlace(place: string | undefined, locationName: string) {
  if (!place || locationName === "All India" || locationName === "Current Location") {
    return true;
  }

  const normalizedPlace = place.toLowerCase();
  return getLocationAliases(locationName).some((alias) => {
    const normalizedAlias = alias.toLowerCase();
    return normalizedPlace.includes(normalizedAlias) || normalizedAlias.includes(normalizedPlace);
  });
}

const english = {
  hire: "Hire",
  work: "Work",
  getStarted: "Get Started",
  badge: "National Security Infrastructure",
  headlinePrefix: "The Professional integration Hub for",
  headlineMain: "ELV Engineerings",
  subheadline:
    "Connect instantly with vetted experts in Fire Safety, CCTV, and Access Control. Build reliable teams for national-scale infrastructure projects.",
  postJob: "Post a Job",
  findWork: "Find Work",
  activity: "Live Platform Activity",
  core: "Core Disciplines",
  coreSub: "Expertise across the entire Extra Low Voltage spectrum.",
};

type TranslationKey = keyof typeof english;

export const translate = (_languageCode: string, key: TranslationKey) => english[key];
