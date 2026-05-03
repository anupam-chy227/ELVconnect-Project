"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { Badge, Button } from "@/components/ui";
import type { Job } from "@/types/api";

type JobMapPreviewProps = {
  jobs: Job[];
  center: [number, number];
  onSelectJob: (job: Job) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getMarkerIcon(job: Job) {
  const urgentClass = job.urgency === "emergency" ? "bg-rose-600" : job.urgency === "urgent" ? "bg-amber-500" : "bg-elv-iris";

  return L.divIcon({
    className: "elv-map-marker",
    html: `<span class="block h-4 w-4 rounded-full border-2 border-white shadow-lg ${urgentClass}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
}

function getJobPosition(job: Job, index: number, center: [number, number]): [number, number] {
  const coordinates = job.location?.coordinates;
  if (coordinates) return [coordinates[1], coordinates[0]];

  const offset = (index + 1) * 0.004;
  return [center[0] + offset, center[1] - offset];
}

export default function JobMapPreview({ jobs, center, onSelectJob }: JobMapPreviewProps) {
  return (
    <div className="h-[300px] overflow-hidden rounded-lg border border-elv-border shadow-glass" aria-label="Nearby jobs map">
      <MapContainer center={center} zoom={11} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {jobs.map((job, index) => (
          <Marker key={job._id} position={getJobPosition(job, index, center)} icon={getMarkerIcon(job)}>
            <Popup>
              <div className="min-w-56">
                <div className="mb-2 flex flex-wrap gap-1">
                  <Badge tone="primary">{job.category.replace(/_/g, " ")}</Badge>
                  <Badge tone={job.urgency === "emergency" ? "danger" : job.urgency === "urgent" ? "warning" : "neutral"}>
                    {job.urgency}
                  </Badge>
                </div>
                <p className="text-sm font-black text-slate-950">{job.title}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {job.city}, {job.area}
                </p>
                <p className="mt-2 text-xs font-black text-slate-950">
                  {formatCurrency(job.budgetMin)} - {formatCurrency(job.budgetMax)}
                </p>
                <Button type="button" size="xs" className="mt-3" onClick={() => onSelectJob(job)}>
                  Open Job Card
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
