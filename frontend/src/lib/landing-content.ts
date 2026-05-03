export interface LandingActivityItem {
  title: string;
  time: string;
  accent: "primary" | "secondary" | "tertiary";
}

export interface LandingStory {
  quote: string;
  company: string;
  meta: string;
}

export interface LandingServiceCard {
  title: string;
  description: string;
  icon: string;
  href: string;
}

export const landingActivityItems: LandingActivityItem[] = [
  {
    title: "New CCTV job posted in Mumbai",
    time: "Just now",
    accent: "primary",
  },
  {
    title: "Verified Engineer joined from Delhi",
    time: "2 mins ago",
    accent: "tertiary",
  },
  {
    title: "Payment of Rs 12,000 secured for Fire Safety project",
    time: "5 mins ago",
    accent: "secondary",
  },
  {
    title: "Access Control SLA completed in Bangalore",
    time: "12 mins ago",
    accent: "primary",
  },
];

export const landingStories: LandingStory[] = [
  {
    quote:
      "The quality of certified networking engineers we found through ELV Connect reduced our deployment timeline by 30%. The platform is indispensable for our Pan-India operations.",
    company: "TechCorp Infrastructure Ltd.",
    meta: "Enterprise Client, Mumbai",
  },
  {
    quote:
      "We used ELV Connect to staff CCTV commissioning across three cities at once. The follow-up speed and verified profiles gave our operations team real confidence.",
    company: "SecureVision Projects",
    meta: "National Integrator, Delhi NCR",
  },
  {
    quote:
      "From fire safety maintenance to access control specialists, the platform helped us find vetted partners faster than our legacy vendor network.",
    company: "Urban Shield Facilities",
    meta: "Facility Client, Bengaluru",
  },
  {
    quote:
      "Their verified fire alarm technicians completed our mall audit with clean documentation, test reports, and a same-day punch list for the safety team.",
    company: "NorthGate Retail Parks",
    meta: "Commercial Portfolio, Noida",
  },
  {
    quote:
      "We hired two access control specialists for a hospital wing upgrade. Badge enrollment, door controller testing, and handover were handled without delays.",
    company: "MedAxis Healthcare",
    meta: "Healthcare Client, Hyderabad",
  },
  {
    quote:
      "The CCTV analytics team helped standardize camera positioning, NVR retention, and remote monitoring across our warehouses in one coordinated rollout.",
    company: "FreightGrid Logistics",
    meta: "Logistics Client, Pune",
  },
  {
    quote:
      "Fiber termination and rack dressing were completed neatly by verified networking professionals. Our IT team approved the site on the first inspection.",
    company: "MetroLink Data Systems",
    meta: "Network Integrator, Chennai",
  },
  {
    quote:
      "For a premium residential tower, ELV Connect helped us combine fire safety, boom barriers, visitor management, and CCTV commissioning under one schedule.",
    company: "Skyline Habitat Group",
    meta: "Builder Client, Gurugram",
  },
  {
    quote:
      "The engineer profiles were clear, the response was quick, and payment tracking made vendor coordination simple for our multi-site maintenance contract.",
    company: "CivicCore Facilities",
    meta: "Facility Management, Kolkata",
  },
  {
    quote:
      "We posted an urgent biometric access job and shortlisted qualified engineers within hours. The final installation passed client acceptance the next morning.",
    company: "SecureEntry Automation",
    meta: "Access Control Partner, Ahmedabad",
  },
  {
    quote:
      "ELV Connect gave us dependable CCTV surveyors for remote branches. Photo evidence, device inventory, and field notes were delivered in a professional format.",
    company: "FinTrust Branch Ops",
    meta: "Banking Operations, Jaipur",
  },
  {
    quote:
      "Our fire suppression maintenance schedule became easier to manage because verified technicians, site visits, and payment milestones were all visible together.",
    company: "Aegis Industrial Safety",
    meta: "Industrial Client, Vadodara",
  },
  {
    quote:
      "We used the platform for structured cabling teams during a campus expansion. The work quality, attendance, and closeout documentation were consistently strong.",
    company: "EduSphere Campus Services",
    meta: "Education Client, Lucknow",
  },
];

export const landingServiceCards: LandingServiceCard[] = [
  {
    title: "Fire Safety",
    description: "Alarms, suppression systems, and compliance audits.",
    icon: "local_fire_department",
    href: "/categories/fire-safety",
  },
  {
    title: "CCTV Systems",
    description: "IP surveillance, NVR setups, and video analytics.",
    icon: "videocam",
    href: "/categories/cctv-systems",
  },
  {
    title: "Access Control",
    description: "Biometrics, RFID, and automated gate systems.",
    icon: "sensor_door",
    href: "/categories/access-control",
  },
  {
    title: "Networking",
    description: "Structured cabling, fiber optics, and active components.",
    icon: "router",
    href: "/categories/networking",
  },
];
