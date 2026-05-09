"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type FooterLink = {
  label: string;
  href: string;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

const localeLinks: FooterLink[] = [
  { label: "India / English", href: "/city-directory" },
  { label: "Hindi-ready UI", href: "/trust-safety" },
  { label: "Help & Support", href: "/trust-safety" },
  { label: "Accessibility", href: "/trust-safety" },
];

const footerSections: FooterSection[] = [
  {
    title: "Marketplace",
    links: [
      { label: "Post a Job", href: "/post-requirement" },
      { label: "Find Work", href: "/jobs" },
      { label: "Hire Engineers", href: "/engineers" },
      { label: "City Directory", href: "/city-directory" },
      { label: "Nearby Jobs", href: "/jobs" },
      { label: "Verified Engineers", href: "/engineers" },
      { label: "Location Matches", href: "/matches" },
      { label: "Services", href: "/services" },
    ],
  },
  {
    title: "ELV Categories",
    links: [
      { label: "CCTV Systems", href: "/categories/cctv-systems" },
      { label: "Fire Safety", href: "/categories/fire-safety" },
      { label: "Access Control", href: "/categories/access-control" },
      { label: "Networking", href: "/categories/networking" },
      { label: "Structured Cabling", href: "/categories/networking" },
      { label: "NVR & DVR", href: "/categories/cctv-systems" },
      { label: "Biometrics", href: "/categories/access-control" },
      { label: "AMC Support", href: "/services" },
    ],
  },
  {
    title: "Clients",
    links: [
      { label: "Client Dashboard", href: "/dashboard/client" },
      { label: "Post Requirement", href: "/post-requirement" },
      { label: "Project Tracking", href: "/client/projects" },
      { label: "Payment Release", href: "/client/payments" },
      { label: "Agreements", href: "/dashboard/client/agreement" },
      { label: "AMC Contracts", href: "/dashboard/client/amc" },
      { label: "Recommended Engineers", href: "/engineers" },
      { label: "Trust & Safety", href: "/trust-safety" },
    ],
  },
  {
    title: "Engineers",
    links: [
      { label: "Engineer Dashboard", href: "/dashboard/engineer" },
      { label: "Open Jobs", href: "/jobs" },
      { label: "Applications", href: "/dashboard/applications" },
      { label: "Verification", href: "/dashboard/engineer/verification" },
      { label: "Earnings", href: "/dashboard/engineer/earnings" },
      { label: "Profile", href: "/dashboard/profile" },
      { label: "Local Work", href: "/jobs" },
      { label: "Get Verified", href: "/register/vendor-engineer" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Verification", href: "/trust-safety" },
      { label: "Secure Payments", href: "/trust-safety" },
      { label: "Milestone Proof", href: "/trust-safety" },
      { label: "Audit Trails", href: "/trust-safety" },
      { label: "Code of Conduct", href: "/trust-safety" },
      { label: "Dispute Support", href: "/trust-safety" },
      { label: "Privacy Policy", href: "/trust-safety" },
      { label: "Terms & Conditions", href: "/trust-safety" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About ELV Verse", href: "/" },
      { label: "How It Works", href: "/trust-safety" },
      { label: "Security", href: "/trust-safety" },
      { label: "Coverage", href: "/city-directory" },
      { label: "Partners", href: "/vendor" },
      { label: "Vendors", href: "/vendor" },
      { label: "News", href: "/" },
      { label: "Contact", href: "/post-requirement" },
    ],
  },
  {
    title: "Popular Cities",
    links: [
      { label: "Delhi NCR", href: "/jobs?city=Delhi+NCR" },
      { label: "Mumbai", href: "/jobs?city=Maharashtra" },
      { label: "Pune", href: "/jobs?city=Maharashtra" },
      { label: "Bengaluru", href: "/jobs?city=Karnataka" },
      { label: "Hyderabad", href: "/jobs?city=Telangana" },
      { label: "Chennai", href: "/jobs?city=Tamil+Nadu" },
      { label: "Ahmedabad", href: "/jobs?city=Gujarat" },
      { label: "Kolkata", href: "/jobs?city=West+Bengal" },
    ],
  },
  {
    title: "Apps",
    links: [
      { label: "Client App", href: "/client" },
      { label: "Engineer App", href: "/engineer" },
      { label: "Vendor App", href: "/vendor" },
      { label: "Admin Console", href: "/admin" },
      { label: "Mobile Web", href: "/" },
      { label: "API Access", href: "/trust-safety" },
      { label: "Secure Login", href: "/login" },
      { label: "Create Account", href: "/register" },
    ],
  },
];

const footerStats: FooterLink[] = [
  { label: "188 verified engineers", href: "/engineers" },
  { label: "44 live jobs", href: "/jobs" },
  { label: "144+ closed work orders", href: "/trust-safety" },
  { label: "Pan-India ELV coverage", href: "/city-directory" },
];

function FooterWordLink({ link, className = "" }: { link: FooterLink; className?: string }) {
  return (
    <Link
      href={link.href}
      className={`inline-flex w-fit text-sm font-bold leading-6 !text-white transition hover:!text-cyan-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${className}`}
    >
      {link.label}
    </Link>
  );
}

export default function PublicFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard") || pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <footer className="mt-auto w-full border-t border-white/10 bg-[#11151b] text-white shadow-[0_-18px_60px_rgba(14,116,144,0.08)]">
      <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div>
            <Link href="/" data-no-translate className="inline-flex text-2xl font-black tracking-tight !text-white">
              ELV Verse
            </Link>
            <div className="mt-8 grid gap-4">
              {localeLinks.map((link) => (
                <FooterWordLink key={link.label} link={link} className="text-base" />
              ))}
            </div>
          </div>

          <nav aria-label="Footer navigation" className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h2 className="text-base font-black !text-white">{section.title}</h2>
                <div className="mt-4 grid gap-2">
                  {section.links.map((link) => (
                    <FooterWordLink key={`${section.title}-${link.label}`} link={link} />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="grid gap-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:items-end">
            <div className="grid gap-4 sm:grid-cols-2">
              {footerStats.map((stat) => (
                <FooterWordLink key={stat.label} link={stat} className="text-lg font-black" />
              ))}
            </div>
            <p className="text-sm font-semibold leading-6 !text-white md:text-right">
              <Link href="/" data-no-translate className="font-black !text-white transition hover:!text-cyan-100">
                ELV Verse
              </Link>{" "}
              is built for verified infrastructure work, secure payment workflows, city-led discovery, and trusted ELV execution across India.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
