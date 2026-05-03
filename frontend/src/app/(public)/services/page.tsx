import Link from "next/link";
import { ArrowRight, Camera, DoorOpen, Flame, Network } from "lucide-react";
import { ELV_CATEGORIES } from "@/lib/constants";

const featuredServices = [
  {
    id: "cctv",
    href: "/categories/cctv-systems",
    title: "CCTV",
    description: "Camera installation, NVR setup, remote monitoring, storage readiness.",
    icon: Camera,
  },
  {
    id: "fire_alarm",
    href: "/categories/fire-safety",
    title: "Fire Safety",
    description: "Detection systems, panels, alarms, compliance-led fire safety execution.",
    icon: Flame,
  },
  {
    id: "access_control",
    href: "/categories/access-control",
    title: "Access Control",
    description: "Biometric readers, RFID credentials, door controllers, secure entry flows.",
    icon: DoorOpen,
  },
  {
    id: "structured_cabling",
    href: "/categories/networking",
    title: "Data Networking",
    description: "Structured cabling, PoE switching, rack cleanup, site network readiness.",
    icon: Network,
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-12 text-foreground">
      <section className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-primary">ELV services</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Security infrastructure services delivered by verified engineers.</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Explore CCTV, fire safety, access control, and networking execution categories across India.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredServices.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.id}
                href={service.href}
                className="group rounded-lg border border-border-subtle bg-surface p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/35 hover:shadow-lg dark:border-elv-dark-border dark:bg-elv-dark-2"
              >
                <span className="grid h-12 w-12 place-items-center rounded-md bg-primary-subtle text-primary dark:bg-elv-dark-3 dark:text-indigo-200">
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-lg font-black">{service.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground dark:text-white/65">{service.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">
                  View engineers
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {ELV_CATEGORIES.map((category) => (
            <span key={category.id} className="rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs font-bold text-muted-foreground dark:border-elv-dark-border dark:bg-elv-dark-2 dark:text-white/60">
              {category.label}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
