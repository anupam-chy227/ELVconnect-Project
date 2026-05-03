export type LanguageOption = {
  code: string;
  label: string;
  native: string;
};

export type LocationOption = {
  name: string;
  lat?: number;
  lng?: number;
};

export const STORAGE_KEYS = {
  language: "elv-preferred-language",
  location: "elv-preferred-location",
  notifications: "elv-notifications-enabled",
};

export const LANGUAGES: LanguageOption[] = [
  { code: "en-IN", label: "English", native: "English" },
  { code: "hi-IN", label: "Hindi", native: "हिन्दी" },
  { code: "bn-IN", label: "Bengali", native: "বাংলা" },
  { code: "te-IN", label: "Telugu", native: "తెలుగు" },
  { code: "mr-IN", label: "Marathi", native: "मराठी" },
  { code: "ta-IN", label: "Tamil", native: "தமிழ்" },
  { code: "ur-IN", label: "Urdu", native: "اردو" },
  { code: "gu-IN", label: "Gujarati", native: "ગુજરાતી" },
  { code: "kn-IN", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml-IN", label: "Malayalam", native: "മലയാളം" },
  { code: "or-IN", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "pa-IN", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "as-IN", label: "Assamese", native: "অসমীয়া" },
  { code: "mai-IN", label: "Maithili", native: "मैथिली" },
  { code: "ks-IN", label: "Kashmiri", native: "कॉशुर" },
  { code: "ne-IN", label: "Nepali", native: "नेपाली" },
  { code: "sa-IN", label: "Sanskrit", native: "संस्कृतम्" },
];

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

const translations = {
  "hi-IN": {
    hire: "हायर करें",
    work: "काम खोजें",
    getStarted: "शुरू करें",
    badge: "राष्ट्रीय सुरक्षा इंफ्रास्ट्रक्चर",
    headlinePrefix: "ELV इंजीनियरिंग के लिए",
    headlineMain: "प्रोफेशनल इंटीग्रेशन हब",
    subheadline:
      "फायर सेफ्टी, CCTV और एक्सेस कंट्रोल विशेषज्ञों से तुरंत जुड़ें। राष्ट्रीय स्तर के प्रोजेक्ट के लिए भरोसेमंद टीम बनाएं।",
    postJob: "जॉब पोस्ट करें",
    findWork: "काम खोजें",
    activity: "लाइव प्लेटफॉर्म गतिविधि",
    core: "मुख्य सेवाएं",
    coreSub: "पूरे Extra Low Voltage क्षेत्र में विशेषज्ञता।",
  },
  "bn-IN": {
    hire: "নিয়োগ করুন",
    work: "কাজ খুঁজুন",
    getStarted: "শুরু করুন",
    badge: "জাতীয় নিরাপত্তা অবকাঠামো",
    headlinePrefix: "ELV Engineering এর জন্য",
    headlineMain: "Professional Integration Hub",
    subheadline:
      "Fire Safety, CCTV এবং Access Control বিশেষজ্ঞদের সাথে দ্রুত সংযোগ করুন।",
    postJob: "জব পোস্ট করুন",
    findWork: "কাজ খুঁজুন",
    activity: "লাইভ প্ল্যাটফর্ম কার্যকলাপ",
    core: "মূল পরিষেবা",
    coreSub: "Extra Low Voltage ক্ষেত্রে পূর্ণাঙ্গ দক্ষতা।",
  },
  "ta-IN": {
    hire: "நிபுணரை நியமிக்கவும்",
    work: "வேலை தேடுங்கள்",
    getStarted: "தொடங்குங்கள்",
    badge: "தேசிய பாதுகாப்பு உட்கட்டமைப்பு",
    headlinePrefix: "ELV Engineering க்கான",
    headlineMain: "Professional Integration Hub",
    subheadline:
      "Fire Safety, CCTV மற்றும் Access Control நிபுணர்களுடன் உடனடியாக இணைக.",
    postJob: "வேலை பதிவிடுக",
    findWork: "வேலை தேடுக",
    activity: "நேரடி செயல்பாடு",
    core: "முக்கிய சேவைகள்",
    coreSub: "Extra Low Voltage துறைகளில் நிபுணத்துவம்.",
  },
  "te-IN": {
    hire: "హైర్ చేయండి",
    work: "పని కనుగొనండి",
    getStarted: "ప్రారంభించండి",
    badge: "జాతీయ భద్రతా మౌలిక వసతులు",
    headlinePrefix: "ELV Engineering కోసం",
    headlineMain: "Professional Integration Hub",
    subheadline:
      "Fire Safety, CCTV, Access Control నిపుణులతో వెంటనే కనెక్ట్ అవ్వండి.",
    postJob: "జాబ్ పోస్ట్ చేయండి",
    findWork: "పని కనుగొనండి",
    activity: "లైవ్ ప్లాట్‌ఫార్మ్ క్రియాశీలత",
    core: "ప్రధాన సేవలు",
    coreSub: "Extra Low Voltage రంగంలో నైపుణ్యం.",
  },
  "mr-IN": {
    hire: "हायर करा",
    work: "काम शोधा",
    getStarted: "सुरू करा",
    badge: "राष्ट्रीय सुरक्षा पायाभूत सुविधा",
    headlinePrefix: "ELV Engineering साठी",
    headlineMain: "Professional Integration Hub",
    subheadline:
      "Fire Safety, CCTV आणि Access Control तज्ज्ञांशी त्वरित कनेक्ट व्हा.",
    postJob: "जॉब पोस्ट करा",
    findWork: "काम शोधा",
    activity: "लाइव्ह प्लॅटफॉर्म अ‍ॅक्टिव्हिटी",
    core: "मुख्य सेवा",
    coreSub: "Extra Low Voltage क्षेत्रातील तज्ज्ञता.",
  },
} as const;

type TranslationKey = keyof (typeof translations)["hi-IN"];

export const translate = (languageCode: string, key: TranslationKey) => {
  const english: Record<TranslationKey, string> = {
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

  return translations[languageCode as keyof typeof translations]?.[key] || english[key];
};
