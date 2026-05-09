import { getLanguageByCode } from "@/lib/experience-preferences";

type TranslationPack = {
  phrases: Record<string, string>;
  terms: Record<string, string>;
};

const commonPhrases: Record<string, Record<string, string>> = {
  hi: {
    "Post a Job": "नौकरी पोस्ट करें",
    "Find Work": "काम खोजें",
    "Hire Engineers": "इंजीनियर हायर करें",
    Search: "खोजें",
    Location: "स्थान",
    "Log in": "लॉग इन",
    "Sign up": "साइन अप",
    Dashboard: "डैशबोर्ड",
    "Quick options": "त्वरित विकल्प",
    "Open full search": "पूरी खोज खोलें",
    "Search pages, jobs, engineers": "पेज, नौकरियां, इंजीनियर खोजें",
    "Search pages, jobs, engineers, actions": "पेज, नौकरियां, इंजीनियर और कार्य खोजें",
    "Create a structured ELV requirement": "स्ट्रक्चर्ड ELV आवश्यकता बनाएं",
    "Browse open ELV jobs by city and category": "शहर और श्रेणी के अनुसार खुले ELV काम देखें",
    "Browse verified ELV specialists": "सत्यापित ELV विशेषज्ञ देखें",
    "Connect Locations": "लोकेशन कनेक्ट करें",
    "Review ELV coverage by Indian city": "भारतीय शहरों के अनुसार ELV कवरेज देखें",
    "Choose a saved region or connect current GPS.": "सेव किया गया क्षेत्र चुनें या मौजूदा GPS कनेक्ट करें।",
    "Connect current GPS": "मौजूदा GPS कनेक्ट करें",
    "Current Location": "वर्तमान स्थान",
    "All India": "पूरे भारत",
    "National ELV execution marketplace": "राष्ट्रीय ELV निष्पादन मार्केटप्लेस",
    "National ELV marketplace": "राष्ट्रीय ELV मार्केटप्लेस",
    "Hire trusted ELV teams or find verified work across India.": "भारत भर में भरोसेमंद ELV टीमों को हायर करें या सत्यापित काम खोजें।",
    "ELV Verse brings CCTV, fire safety, access control, and data networking work into one trust-first marketplace with city context, verified engineers, milestone proof, and secure UPI-ready payments.": "ELV Verse CCTV, फायर सेफ्टी, एक्सेस कंट्रोल और डेटा नेटवर्किंग कार्य को शहर संदर्भ, सत्यापित इंजीनियर, माइलस्टोन प्रमाण और सुरक्षित UPI-रेडी भुगतान के साथ एक भरोसेमंद मार्केटप्लेस में लाता है।",
    "Post trusted work or start finding verified ELV jobs today.": "भरोसेमंद काम पोस्ट करें या आज ही सत्यापित ELV नौकरियां खोजें।",
    "One marketplace for site surveys, verified engineers, milestone evidence, work orders, payments, and reputation.": "साइट सर्वे, सत्यापित इंजीनियर, माइलस्टोन प्रमाण, वर्क ऑर्डर, भुगतान और प्रतिष्ठा के लिए एक मार्केटप्लेस।",
    "Live Platform Activity": "लाइव प्लेटफॉर्म गतिविधि",
    "Core Disciplines": "मुख्य विशेषज्ञताएं",
    "Location-first discovery": "लोकेशन-फर्स्ट खोज",
    "Nearby jobs by city, area, payout, and trust.": "शहर, क्षेत्र, भुगतान और भरोसे के अनुसार नजदीकी नौकरियां।",
    "Verified specialists ready for real site execution.": "वास्तविक साइट निष्पादन के लिए तैयार सत्यापित विशेषज्ञ।",
    "Client trust": "क्लाइंट भरोसा",
    "Reviews and reputation": "समीक्षाएं और प्रतिष्ठा",
    "Regional teams can move faster in familiar language.": "क्षेत्रीय टीमें परिचित भाषा में तेजी से काम कर सकती हैं।",
    "Need an engineer, survey, or callback today?": "आज इंजीनियर, सर्वे या कॉलबैक चाहिए?",
    "Start follow-up": "फॉलो-अप शुरू करें",
    "Discover engineers": "इंजीनियर खोजें",
    "Business spotlight": "बिजनेस स्पॉटलाइट",
    "National live market": "राष्ट्रीय लाइव मार्केट",
    "ELV Live Market": "ELV लाइव मार्केट",
    "Market feed": "मार्केट फीड",
    "Secure payment rail active": "सुरक्षित भुगतान रेल सक्रिय",
  },
  bn: {
    "Post a Job": "জব পোস্ট করুন",
    "Find Work": "কাজ খুঁজুন",
    "Hire Engineers": "ইঞ্জিনিয়ার নিয়োগ করুন",
    Search: "অনুসন্ধান",
    Location: "অবস্থান",
    "Log in": "লগ ইন",
    "Sign up": "সাইন আপ",
    Dashboard: "ড্যাশবোর্ড",
    "Quick options": "দ্রুত অপশন",
    "Open full search": "পূর্ণ অনুসন্ধান খুলুন",
    "Search pages, jobs, engineers": "পৃষ্ঠা, জব, ইঞ্জিনিয়ার খুঁজুন",
    "Connect current GPS": "বর্তমান GPS সংযুক্ত করুন",
    "Current Location": "বর্তমান অবস্থান",
    "All India": "সারা ভারত",
  },
  te: {
    "Post a Job": "ఉద్యోగం పోస్ట్ చేయండి",
    "Find Work": "పని కనుగొనండి",
    "Hire Engineers": "ఇంజినీర్లను నియమించండి",
    Search: "శోధన",
    Location: "ప్రదేశం",
    "Log in": "లాగిన్",
    "Sign up": "సైన్ అప్",
    Dashboard: "డ్యాష్‌బోర్డ్",
    "Quick options": "త్వరిత ఎంపికలు",
    "Open full search": "పూర్తి శోధన తెరవండి",
    "Search pages, jobs, engineers": "పేజీలు, ఉద్యోగాలు, ఇంజినీర్లను శోధించండి",
    "Connect current GPS": "ప్రస్తుత GPS కలపండి",
    "Current Location": "ప్రస్తుత ప్రదేశం",
    "All India": "మొత్తం భారత్",
  },
  mr: {
    "Post a Job": "जॉब पोस्ट करा",
    "Find Work": "काम शोधा",
    "Hire Engineers": "इंजिनिअर्स नियुक्त करा",
    Search: "शोधा",
    Location: "स्थान",
    "Log in": "लॉग इन",
    "Sign up": "साइन अप",
    Dashboard: "डॅशबोर्ड",
    "Quick options": "जलद पर्याय",
    "Open full search": "पूर्ण शोध उघडा",
    "Search pages, jobs, engineers": "पेजेस, जॉब्स, इंजिनिअर्स शोधा",
    "Connect current GPS": "सध्याचा GPS जोडा",
    "Current Location": "सध्याचे स्थान",
    "All India": "संपूर्ण भारत",
  },
  ta: {
    "Post a Job": "வேலை பதிவிடு",
    "Find Work": "வேலை தேடு",
    "Hire Engineers": "பொறியாளர்களை நியமி",
    Search: "தேடல்",
    Location: "இடம்",
    "Log in": "உள்நுழை",
    "Sign up": "பதிவு செய்",
    Dashboard: "டாஷ்போர்டு",
    "Quick options": "விரைவு விருப்பங்கள்",
    "Open full search": "முழு தேடலை திற",
    "Search pages, jobs, engineers": "பக்கங்கள், வேலைகள், பொறியாளர்கள் தேடு",
    "Connect current GPS": "தற்போதைய GPS இணை",
    "Current Location": "தற்போதைய இடம்",
    "All India": "முழு இந்தியா",
  },
  ur: {
    "Post a Job": "جاب پوسٹ کریں",
    "Find Work": "کام تلاش کریں",
    "Hire Engineers": "انجینئرز ہائر کریں",
    Search: "تلاش",
    Location: "مقام",
    "Log in": "لاگ ان",
    "Sign up": "سائن اپ",
    Dashboard: "ڈیش بورڈ",
    "Quick options": "فوری اختیارات",
    "Open full search": "مکمل تلاش کھولیں",
    "Search pages, jobs, engineers": "صفحات، جابز، انجینئرز تلاش کریں",
    "Connect current GPS": "موجودہ GPS جوڑیں",
    "Current Location": "موجودہ مقام",
    "All India": "پورا بھارت",
  },
  gu: {
    "Post a Job": "જોબ પોસ્ટ કરો",
    "Find Work": "કામ શોધો",
    "Hire Engineers": "ઇજનેરોને હાયર કરો",
    Search: "શોધો",
    Location: "સ્થાન",
    "Log in": "લૉગ ઇન",
    "Sign up": "સાઇન અપ",
    Dashboard: "ડેશબોર્ડ",
    "Quick options": "ઝડપી વિકલ્પો",
    "Open full search": "પૂર્ણ શોધ ખોલો",
    "Search pages, jobs, engineers": "પેજ, જોબ્સ, ઇજનેરો શોધો",
    "Connect current GPS": "વર્તમાન GPS જોડો",
    "Current Location": "વર્તમાન સ્થાન",
    "All India": "સમગ્ર ભારત",
  },
  kn: {
    "Post a Job": "ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಿ",
    "Find Work": "ಕೆಲಸ ಹುಡುಕಿ",
    "Hire Engineers": "ಎಂಜಿನಿಯರ್‌ಗಳನ್ನು ನೇಮಿಸಿ",
    Search: "ಹುಡುಕಿ",
    Location: "ಸ್ಥಳ",
    "Log in": "ಲಾಗಿನ್",
    "Sign up": "ಸೈನ್ ಅಪ್",
    Dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "Quick options": "ತ್ವರಿತ ಆಯ್ಕೆಗಳು",
    "Open full search": "ಪೂರ್ಣ ಹುಡುಕಾಟ ತೆರೆಯಿರಿ",
    "Search pages, jobs, engineers": "ಪುಟಗಳು, ಕೆಲಸಗಳು, ಎಂಜಿನಿಯರ್‌ಗಳನ್ನು ಹುಡುಕಿ",
    "Connect current GPS": "ಪ್ರಸ್ತುತ GPS ಸಂಪರ್ಕಿಸಿ",
    "Current Location": "ಪ್ರಸ್ತುತ ಸ್ಥಳ",
    "All India": "ಪೂರ್ಣ ಭಾರತ",
  },
  ml: {
    "Post a Job": "ജോലി പോസ്റ്റ് ചെയ്യുക",
    "Find Work": "ജോലി കണ്ടെത്തുക",
    "Hire Engineers": "എഞ്ചിനീയർമാരെ നിയമിക്കുക",
    Search: "തിരയുക",
    Location: "സ്ഥലം",
    "Log in": "ലോഗിൻ",
    "Sign up": "സൈൻ അപ്പ്",
    Dashboard: "ഡാഷ്ബോർഡ്",
    "Quick options": "വേഗത്തിലുള്ള ഓപ്ഷനുകൾ",
    "Open full search": "മുഴുവൻ തിരയൽ തുറക്കുക",
    "Search pages, jobs, engineers": "പേജുകൾ, ജോലികൾ, എഞ്ചിനീയർമാർ തിരയുക",
    "Connect current GPS": "നിലവിലെ GPS ബന്ധിപ്പിക്കുക",
    "Current Location": "നിലവിലെ സ്ഥലം",
    "All India": "മുഴുവൻ ഇന്ത്യ",
  },
  pa: {
    "Post a Job": "ਨੌਕਰੀ ਪੋਸਟ ਕਰੋ",
    "Find Work": "ਕੰਮ ਲੱਭੋ",
    "Hire Engineers": "ਇੰਜੀਨੀਅਰ ਹਾਇਰ ਕਰੋ",
    Search: "ਖੋਜ",
    Location: "ਥਾਂ",
    "Log in": "ਲੌਗ ਇਨ",
    "Sign up": "ਸਾਈਨ ਅੱਪ",
    Dashboard: "ਡੈਸ਼ਬੋਰਡ",
    "Quick options": "ਤੇਜ਼ ਵਿਕਲਪ",
    "Open full search": "ਪੂਰੀ ਖੋਜ ਖੋਲ੍ਹੋ",
    "Search pages, jobs, engineers": "ਪੇਜ, ਨੌਕਰੀਆਂ, ਇੰਜੀਨੀਅਰ ਖੋਜੋ",
    "Connect current GPS": "ਮੌਜੂਦਾ GPS ਜੋੜੋ",
    "Current Location": "ਮੌਜੂਦਾ ਥਾਂ",
    "All India": "ਪੂਰਾ ਭਾਰਤ",
  },
};

const commonTerms: Record<string, Record<string, string>> = {
  hi: {
    Jobs: "नौकरियां",
    Job: "नौकरी",
    Work: "काम",
    Engineers: "इंजीनियर",
    Engineer: "इंजीनियर",
    Verified: "सत्यापित",
    Trust: "भरोसा",
    Payments: "भुगतान",
    Payment: "भुगतान",
    City: "शहर",
    Category: "श्रेणी",
    Clients: "क्लाइंट",
    Client: "क्लाइंट",
    Dashboard: "डैशबोर्ड",
    Profile: "प्रोफाइल",
    Applications: "आवेदन",
    Invoices: "इनवॉइस",
    Projects: "प्रोजेक्ट",
    Services: "सेवाएं",
    Reviews: "समीक्षाएं",
    Active: "सक्रिय",
    Open: "खुला",
    Closed: "बंद",
    Today: "आज",
    Updated: "अपडेटेड",
  },
  bn: { Jobs: "জব", Job: "জব", Work: "কাজ", Engineers: "ইঞ্জিনিয়ার", Engineer: "ইঞ্জিনিয়ার", Verified: "যাচাইকৃত", Trust: "বিশ্বাস", Payments: "পেমেন্ট", City: "শহর" },
  te: { Jobs: "ఉద్యోగాలు", Job: "ఉద్యోగం", Work: "పని", Engineers: "ఇంజినీర్లు", Engineer: "ఇంజినీర్", Verified: "ధృవీకరించబడిన", Trust: "నమ్మకం", Payments: "చెల్లింపులు", City: "నగరం" },
  mr: { Jobs: "जॉब्स", Job: "जॉब", Work: "काम", Engineers: "इंजिनिअर्स", Engineer: "इंजिनिअर", Verified: "सत्यापित", Trust: "विश्वास", Payments: "पेमेंट्स", City: "शहर" },
  ta: { Jobs: "வேலைகள்", Job: "வேலை", Work: "வேலை", Engineers: "பொறியாளர்கள்", Engineer: "பொறியாளர்", Verified: "சரிபார்க்கப்பட்ட", Trust: "நம்பிக்கை", Payments: "கட்டணங்கள்", City: "நகரம்" },
  ur: { Jobs: "جابز", Job: "جاب", Work: "کام", Engineers: "انجینئرز", Engineer: "انجینئر", Verified: "تصدیق شدہ", Trust: "اعتماد", Payments: "ادائیگیاں", City: "شہر" },
  gu: { Jobs: "જોબ્સ", Job: "જોબ", Work: "કામ", Engineers: "ઇજનેરો", Engineer: "ઇજનેર", Verified: "ચકાસાયેલ", Trust: "વિશ્વાસ", Payments: "ચુકવણી", City: "શહેર" },
  kn: { Jobs: "ಕೆಲಸಗಳು", Job: "ಕೆಲಸ", Work: "ಕೆಲಸ", Engineers: "ಎಂಜಿನಿಯರ್‌ಗಳು", Engineer: "ಎಂಜಿನಿಯರ್", Verified: "ಪರಿಶೀಲಿತ", Trust: "ನಂಬಿಕೆ", Payments: "ಪಾವತಿಗಳು", City: "ನಗರ" },
  ml: { Jobs: "ജോലികൾ", Job: "ജോലി", Work: "ജോലി", Engineers: "എഞ്ചിനീയർമാർ", Engineer: "എഞ്ചിനീയർ", Verified: "സ്ഥിരീകരിച്ച", Trust: "വിശ്വാസം", Payments: "പേയ്മെന്റുകൾ", City: "നഗരം" },
  pa: { Jobs: "ਨੌਕਰੀਆਂ", Job: "ਨੌਕਰੀ", Work: "ਕੰਮ", Engineers: "ਇੰਜੀਨੀਅਰ", Engineer: "ਇੰਜੀਨੀਅਰ", Verified: "ਤਸਦੀਕਸ਼ੁਦਾ", Trust: "ਭਰੋਸਾ", Payments: "ਭੁਗਤਾਨ", City: "ਸ਼ਹਿਰ" },
};

const packs: Record<string, TranslationPack> = Object.fromEntries(
  Object.entries(commonPhrases).map(([language, phrases]) => [
    language,
    {
      phrases,
      terms: commonTerms[language] || {},
    },
  ]),
) as Record<string, TranslationPack>;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitOuterWhitespace(value: string) {
  const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);

  return {
    leading: match?.[1] ?? "",
    core: match?.[2] ?? value,
    trailing: match?.[3] ?? "",
  };
}

export function getLocalTranslation(languageCode: string, source: string) {
  const language = getLanguageByCode(languageCode);
  const pack = packs[language.translateCode];

  if (!pack || language.translateCode === "en") {
    return source;
  }

  const { leading, core, trailing } = splitOuterWhitespace(source);
  const normalizedCore = core.replace(/\s+/g, " ").trim();
  const phraseTranslation = pack.phrases[normalizedCore];

  if (phraseTranslation) {
    return `${leading}${phraseTranslation}${trailing}`;
  }

  let translated = core;
  const terms = Object.entries(pack.terms).sort(([left], [right]) => right.length - left.length);

  terms.forEach(([term, replacement]) => {
    translated = translated.replace(new RegExp(`\\b${escapeRegExp(term)}\\b`, "gi"), replacement);
  });

  return translated === core ? source : `${leading}${translated}${trailing}`;
}
