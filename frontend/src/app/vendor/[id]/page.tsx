import { BadgeCheck, MapPin, Star } from "lucide-react";
import { DataCard, StatusPill, WorkspaceShell } from "@/components/ELVConnect/WorkspaceShell";
import { vendors } from "@/lib/elv-demo-data";

export default function VendorProfilePage({ params }: { params: { id: string } }) {
  const vendor = vendors.find((item) => item.id === params.id) || vendors[0];

  return (
    <WorkspaceShell title={vendor.name} subtitle={`${vendor.category} vendor profile, service radius, certifications, and performance metrics.`}>
      <section className="grid gap-3 md:grid-cols-3">
        <DataCard title="Rating" value={String(vendor.rating)} caption="Customer average" icon={Star} />
        <DataCard title="Match Score" value={`${vendor.score}%`} caption="Category and distance fit" icon={BadgeCheck} />
        <DataCard title="Coverage" value={vendor.radius} caption={vendor.city} icon={MapPin} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-bold">Certifications</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {vendor.certifications.map((certification) => (
              <span key={certification} className="rounded-md border border-primary/20 bg-primary-container/10 px-3 py-2 text-xs font-bold text-primary">
                {certification}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-bold">Operational Status</h2>
          <div className="mt-3 space-y-2 text-xs text-slate-600">
            <p>Response time: {vendor.response}</p>
            <p>Service radius: {vendor.radius}</p>
            <p>Primary city: {vendor.city}</p>
            <StatusPill status="approved" />
          </div>
        </div>
      </section>
    </WorkspaceShell>
  );
}
