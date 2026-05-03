export type CategorySlug =
  | "fire-safety"
  | "cctv-systems"
  | "access-control"
  | "networking";

export type CategoryContent = {
  slug: CategorySlug;
  title: string;
  shortTitle: string;
  category: "fire_alarm" | "cctv" | "access_control" | "structured_cabling";
  icon: string;
  image: string;
  summary: string;
  overview: string;
  systems: string[];
  applications: string[];
  standards: string[];
  brands: string[];
  buyerChecklist: string[];
  gallery: {
    src: string;
    alt: string;
  }[];
  catalog: {
    name: string;
    image: string;
    description: string;
    budget: string;
    fitFor: string;
  }[];
};

export const categoryContent: CategoryContent[] = [
  {
    slug: "fire-safety",
    title: "Fire Safety Systems",
    shortTitle: "Fire Safety",
    category: "fire_alarm",
    icon: "local_fire_department",
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22731c7c6f?auto=format&fit=crop&w=1400&q=80",
    summary: "Detection, alarm, evacuation, suppression, and compliance support for safer buildings.",
    overview:
      "Fire safety covers the full life cycle of protection: smoke and heat detection, fire alarm panels, notification appliances, emergency voice evacuation, suppression integration, testing, maintenance, and authority compliance documentation. A good system is not only hardware; it is correct zoning, cable integrity, battery backup, cause-and-effect programming, and periodic inspection.",
    systems: [
      "Addressable and conventional fire alarm panels",
      "Smoke, heat, beam, duct, and flame detectors",
      "Manual call points, sounders, strobes, and voice evacuation",
      "Fire suppression interface and gas release controls",
      "Fire-rated cabling, monitoring modules, and control relays",
      "AMC testing, detector cleaning, cause-and-effect reports",
    ],
    applications: [
      "Residential towers and gated communities",
      "Hospitals, malls, schools, and hotels",
      "Warehouses, factories, and data rooms",
      "Office buildings and commercial fit-outs",
    ],
    standards: ["NFPA", "NBC India", "IS 2189", "IS 15908", "local fire authority approvals"],
    brands: [
      "Honeywell",
      "Notifier",
      "Johnson Controls",
      "Tyco",
      "Simplex",
      "Siemens",
      "Bosch",
      "Edwards",
      "GST",
      "Agni",
      "Ravel",
      "Cooper",
      "Hochiki",
      "Apollo",
      "System Sensor",
      "Morley",
    ],
    buyerChecklist: [
      "Ask for approved drawings and device layout before installation.",
      "Check panel battery backup, loop capacity, and future expansion room.",
      "Confirm fire-rated cables, proper tagging, and test certificates.",
      "Include quarterly testing and annual maintenance in the scope.",
    ],
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1581092160607-ee22731c7c6f?auto=format&fit=crop&w=900&q=80",
        alt: "Fire safety engineer inspection",
      },
      {
        src: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80",
        alt: "Industrial safety control panel",
      },
      {
        src: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80",
        alt: "Safety technician at site",
      },
      {
        src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
        alt: "Safety team planning",
      },
      {
        src: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80",
        alt: "Fire safety installation site",
      },
      {
        src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80",
        alt: "Technician checking safety system",
      },
    ],
    catalog: [
      {
        name: "Addressable fire alarm panel",
        image:
          "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=900&q=80",
        description:
          "Loop-based control panel for large sites with exact device location, event history, and integration relays.",
        budget: "Indicative: quote-based by loop/device count",
        fitFor: "Commercial towers, hospitals, malls",
      },
      {
        name: "Smoke and heat detector set",
        image:
          "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=900&q=80",
        description:
          "Ceiling devices for early warning, zone coverage, and scheduled testing under AMC scope.",
        budget: "Indicative: per device plus installation",
        fitFor: "Offices, hotels, schools",
      },
      {
        name: "Voice evacuation and sounder system",
        image:
          "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
        description:
          "Emergency announcement, strobes, sounders, and evacuation messaging tied to fire zones.",
        budget: "Indicative: quote-based by floor and speaker count",
        fitFor: "Public buildings, campuses, transit",
      },
    ],
  },
  {
    slug: "cctv-systems",
    title: "CCTV Surveillance Systems",
    shortTitle: "CCTV Systems",
    category: "cctv",
    icon: "videocam",
    image:
      "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1400&q=80",
    summary: "IP cameras, NVRs, storage, monitoring, analytics, and secure video operations.",
    overview:
      "CCTV systems help monitor, investigate, and protect sites through cameras, recording, analytics, and remote access. A professional design considers field of view, lens size, low-light performance, retention days, network bandwidth, cyber security, UPS backup, and operator workflows.",
    systems: [
      "IP dome, bullet, turret, PTZ, fisheye, and ANPR cameras",
      "NVR, VMS, NAS storage, and video retention planning",
      "PoE switching, VLANs, fiber uplinks, and UPS power",
      "Video analytics for intrusion, people counting, and line crossing",
      "Control room video walls and remote mobile viewing",
      "Health monitoring, firmware updates, and camera cleaning",
    ],
    applications: [
      "Retail chains and warehouses",
      "Residential societies and parking areas",
      "Factories, offices, schools, and hospitals",
      "City surveillance and public infrastructure",
    ],
    standards: ["ONVIF", "cyber-secure password policy", "IT Act compliance", "site privacy policy"],
    brands: [
      "Hikvision",
      "Dahua",
      "CP Plus",
      "Axis",
      "Hanwha Vision",
      "Bosch",
      "Honeywell",
      "Avigilon",
      "Pelco",
      "Uniview",
      "Vivotek",
      "Panasonic i-PRO",
      "Milestone",
      "Genetec",
      "Matrix",
      "Prama",
    ],
    buyerChecklist: [
      "Specify required retention days and recording resolution.",
      "Avoid blind spots with a camera coverage drawing.",
      "Use separate network credentials and disable default passwords.",
      "Plan storage, UPS, and remote access securely.",
    ],
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=900&q=80",
        alt: "CCTV camera installation",
      },
      {
        src: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80",
        alt: "Surveillance control room",
      },
      {
        src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
        alt: "Security monitoring workstation",
      },
      {
        src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
        alt: "Commercial CCTV environment",
      },
      {
        src: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
        alt: "Residential security camera coverage",
      },
      {
        src: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80",
        alt: "Security access and camera point",
      },
    ],
    catalog: [
      {
        name: "IP dome and bullet cameras",
        image:
          "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=900&q=80",
        description:
          "Indoor/outdoor camera mix with night vision, WDR, PoE power, and correct lens selection.",
        budget: "Indicative: per camera plus cable and mounting",
        fitFor: "Retail, societies, offices",
      },
      {
        name: "NVR and storage rack",
        image:
          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
        description:
          "Recording appliance with surveillance-grade disks, UPS, network ports, and retention planning.",
        budget: "Indicative: based on channels and retention days",
        fitFor: "Control rooms and multi-site monitoring",
      },
      {
        name: "Analytics and ANPR camera",
        image:
          "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
        description:
          "Smart detection for gates, parking, intrusion lines, people count, and search workflows.",
        budget: "Indicative: quote-based by analytics license",
        fitFor: "Parking, gates, factories",
      },
    ],
  },
  {
    slug: "access-control",
    title: "Access Control Systems",
    shortTitle: "Access Control",
    category: "access_control",
    icon: "sensor_door",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1400&q=80",
    summary: "Door controllers, RFID, biometrics, locks, turnstiles, and visitor access workflows.",
    overview:
      "Access control manages who can enter which area and when. A strong system combines controllers, credentials, readers, locks, door sensors, request-to-exit devices, visitor management, attendance integration, emergency release, and audit trails.",
    systems: [
      "RFID, BLE, QR, mobile, and biometric readers",
      "Single-door, multi-door, and elevator access controllers",
      "Mag locks, strike locks, drop bolts, and door sensors",
      "Turnstile, flap barrier, boom barrier, and gate automation integration",
      "Visitor management and attendance software",
      "Fire alarm release and emergency evacuation logic",
    ],
    applications: [
      "Corporate offices and co-working spaces",
      "Factories, labs, hospitals, and data centers",
      "Residential towers, clubs, and gyms",
      "Schools, campuses, and restricted zones",
    ],
    standards: ["emergency egress compliance", "fire release integration", "data privacy policy"],
    brands: [
      "HID",
      "Suprema",
      "ZKTeco",
      "Honeywell",
      "Johnson Controls",
      "Bosch",
      "Siemens",
      "Matrix",
      "eSSL",
      "Rosslare",
      "Dormakaba",
      "Assa Abloy",
      "Hikvision",
      "Dahua",
      "Paxton",
      "LenelS2",
    ],
    buyerChecklist: [
      "Define access groups, time schedules, and admin permissions.",
      "Confirm fire release and fail-safe or fail-secure logic.",
      "Plan backup power for controllers and locks.",
      "Keep audit logs and enrollment process documented.",
    ],
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80",
        alt: "Access control reader",
      },
      {
        src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80",
        alt: "Smart door lock system",
      },
      {
        src: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80",
        alt: "Modern office access lobby",
      },
      {
        src: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80",
        alt: "Corporate entry control",
      },
      {
        src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
        alt: "Office secured entry",
      },
      {
        src: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=900&q=80",
        alt: "Security desk verification",
      },
    ],
    catalog: [
      {
        name: "Biometric and RFID reader",
        image:
          "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80",
        description:
          "Reader options for fingerprint, face, card, QR, or mobile credential access workflows.",
        budget: "Indicative: per door plus software setup",
        fitFor: "Offices, labs, gyms",
      },
      {
        name: "Door controller and lock kit",
        image:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80",
        description:
          "Controller, mag lock/strike lock, door sensor, REX button, power supply, and emergency release.",
        budget: "Indicative: per door by lock type",
        fitFor: "Secure doors and restricted rooms",
      },
      {
        name: "Turnstile and visitor flow",
        image:
          "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80",
        description:
          "Lobby entry automation with QR passes, RFID cards, visitor logs, and attendance integration.",
        budget: "Indicative: quote-based by lane count",
        fitFor: "Corporate lobbies and campuses",
      },
    ],
  },
  {
    slug: "networking",
    title: "Networking and Structured Cabling",
    shortTitle: "Networking",
    category: "structured_cabling",
    icon: "router",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80",
    summary: "LAN, fiber, racks, Wi-Fi, PoE switching, patching, testing, and network readiness.",
    overview:
      "ELV systems depend on stable network infrastructure. Networking includes structured cabling, fiber backbones, rack design, PoE switching, Wi-Fi coverage, segmentation, labeling, testing, and documentation. Poor cabling causes repeated CCTV, access, and BMS failures, so certification and clean rack work matter.",
    systems: [
      "Cat6, Cat6A, fiber optic, backbone, and riser cabling",
      "Patch panels, racks, cable managers, PDU, UPS, and earthing",
      "Core, distribution, and access switches with PoE budgeting",
      "Wi-Fi access points, controllers, heat maps, and roaming",
      "VLAN, IP planning, firewall handover, and network documentation",
      "Fluke testing, OTDR testing, labeling, and as-built reports",
    ],
    applications: [
      "Offices, campuses, hotels, and hospitals",
      "CCTV, access control, BMS, AV, and intercom backbones",
      "Warehouses, industrial plants, and data rooms",
      "Retail, education, and multi-site rollouts",
    ],
    standards: ["TIA/EIA", "ISO/IEC 11801", "BICSI practices", "structured cabling test reports"],
    brands: [
      "Cisco",
      "Aruba",
      "Ubiquiti",
      "TP-Link Omada",
      "D-Link",
      "Netgear",
      "Ruckus",
      "Juniper",
      "Fortinet",
      "Molex",
      "CommScope",
      "Panduit",
      "Legrand",
      "Schneider Electric",
      "R&M",
      "Dintek",
    ],
    buyerChecklist: [
      "Ask for rack elevation, cable schedule, and labeling format.",
      "Confirm PoE budget for cameras, APs, and access devices.",
      "Demand copper/fiber test reports before handover.",
      "Plan VLANs and IP ranges before connecting ELV devices.",
    ],
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
        alt: "Network rack and servers",
      },
      {
        src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80",
        alt: "Network hardware cabinet",
      },
      {
        src: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=900&q=80",
        alt: "Structured cabling work",
      },
      {
        src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
        alt: "Networking monitoring laptop",
      },
      {
        src: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=900&q=80",
        alt: "Network configuration screen",
      },
      {
        src: "https://images.unsplash.com/photo-1600267204091-5c1ab8b10c02?auto=format&fit=crop&w=900&q=80",
        alt: "Fiber cable work",
      },
    ],
    catalog: [
      {
        name: "Structured cabling rack",
        image:
          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
        description:
          "Patch panels, cable managers, rack dressing, labeling, PDU, UPS, and handover documentation.",
        budget: "Indicative: per node plus rack accessories",
        fitFor: "Offices, CCTV rooms, data closets",
      },
      {
        name: "Fiber backbone and OTDR testing",
        image:
          "https://images.unsplash.com/photo-1600267204091-5c1ab8b10c02?auto=format&fit=crop&w=900&q=80",
        description:
          "Fiber pulling, splicing, LIU termination, OTDR reports, and riser/backbone readiness.",
        budget: "Indicative: per meter/core and test report",
        fitFor: "Campuses, towers, warehouses",
      },
      {
        name: "PoE switching and Wi-Fi access",
        image:
          "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80",
        description:
          "Switching, PoE budget, VLAN handover, AP placement, heat-map planning, and network labels.",
        budget: "Indicative: based on port count and coverage",
        fitFor: "CCTV, access control, office LAN",
      },
    ],
  },
];

export const getCategoryBySlug = (slug: string) =>
  categoryContent.find((category) => category.slug === slug);
