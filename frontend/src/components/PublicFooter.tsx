"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Building2, CreditCard, Languages, MapPin, ShieldCheck } from "lucide-react";

const footerLinks = [
  { label: "Fire Safety", href: "/categories/fire-safety" },
  { label: "CCTV Systems", href: "/categories/cctv-systems" },
  { label: "Networking", href: "/categories/networking" },
  { label: "Access Control", href: "/categories/access-control" },
  { label: "City Directory", href: "/city-directory" },
  { label: "Trust & Safety", href: "/trust-safety" },
];

const trustItems = [
  { label: "UPI-first payments", icon: CreditCard },
  { label: "Verified engineers", icon: ShieldCheck },
  { label: "Pan-India coverage", icon: MapPin },
  { label: "Hindi-ready UI", icon: Languages },
];

export default function PublicFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard") || pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <footer className="mt-auto w-full border-t border-border-subtle bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1.1fr_1.4fr] lg:px-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-indigo-100">
            <Building2 className="h-4 w-4 text-indigo-300" />
            ELV Connect
          </div>
          <h2 className="mt-4 max-w-md text-2xl font-black">
            National security infrastructure marketplace for verified ELV work.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            CCTV, fire safety, access control, networking, secure payments, and location-led discovery for clients and engineers across India.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <span key={item.label} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                  <Icon className="h-3.5 w-3.5 text-indigo-300" />
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex min-h-16 items-center justify-between rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-100 transition hover:-translate-y-0.5 hover:border-indigo-300/40 hover:bg-white/[0.08]"
            >
              {link.label}
              <ArrowUpRight className="h-4 w-4 text-indigo-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-4 text-center text-xs text-slate-400">
        ELV Connect. Built for secure, verified, India-wide infrastructure delivery.
      </div>
    </footer>
  );
}
