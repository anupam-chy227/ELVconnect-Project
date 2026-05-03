import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ImageIcon,
  MessageSquareText,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { cn, progressWidthClass } from "@/components/ui/utils";

export type ProjectStepKey = "posted" | "survey" | "quote" | "work" | "testing" | "handover";
export type ProjectStepStatus = "complete" | "current" | "blocked" | "pending";

export type ProjectTimelineStep = {
  key: ProjectStepKey;
  label: string;
  status: ProjectStepStatus;
  date?: string;
  description?: string;
};

export type ProjectActivity = {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};

export type ProjectProof = {
  id: string;
  title: string;
  caption: string;
  date: string;
  imageUrl?: string;
  status?: "verified" | "pending" | "rejected";
};

export type ProjectTrackingPanelProps = {
  title?: string;
  subtitle?: string;
  status?: "on_track" | "at_risk" | "delayed" | "completed";
  steps?: ProjectTimelineStep[];
  activities?: ProjectActivity[];
  proofs?: ProjectProof[];
  className?: string;
};

const defaultSteps: ProjectTimelineStep[] = [
  {
    key: "posted",
    label: "Posted",
    status: "complete",
    date: "12 Apr",
    description: "Requirement, site details, budget, and drawings captured.",
  },
  {
    key: "survey",
    label: "Survey",
    status: "complete",
    date: "13 Apr",
    description: "Site visit completed and measurement notes uploaded.",
  },
  {
    key: "quote",
    label: "Quote",
    status: "complete",
    date: "14 Apr",
    description: "BOQ and commercial quote received for review.",
  },
  {
    key: "work",
    label: "Work",
    status: "current",
    date: "In progress",
    description: "Installation team is executing approved scope.",
  },
  {
    key: "testing",
    label: "Testing",
    status: "pending",
    date: "Pending",
    description: "Commissioning checklist and QA report pending.",
  },
  {
    key: "handover",
    label: "Handover",
    status: "pending",
    date: "Pending",
    description: "Warranty, drawings, and final sign-off pending.",
  },
];

const defaultActivities: ProjectActivity[] = [
  {
    id: "activity-1",
    title: "Installation proof uploaded",
    detail: "Vendor uploaded rack dressing and camera mounting photos.",
    time: "Today, 10:35 AM",
    tone: "success",
  },
  {
    id: "activity-2",
    title: "Material dispatch confirmed",
    detail: "NVR, PoE switch, conduits, and brackets verified before dispatch.",
    time: "Yesterday, 4:10 PM",
    tone: "neutral",
  },
  {
    id: "activity-3",
    title: "Testing report due",
    detail: "QA checklist is expected after installation stage completion.",
    time: "Due tomorrow",
    tone: "warning",
  },
];

const defaultProofs: ProjectProof[] = [
  {
    id: "proof-1",
    title: "Survey coverage",
    caption: "Entry points, cable route, and camera positions captured.",
    date: "13 Apr",
    status: "verified",
  },
  {
    id: "proof-2",
    title: "Material readiness",
    caption: "Devices, connectors, rack material, and labels checked.",
    date: "15 Apr",
    status: "verified",
  },
  {
    id: "proof-3",
    title: "Work progress",
    caption: "First-floor installation and rack dressing in progress.",
    date: "18 Apr",
    status: "pending",
  },
];

const statusConfig = {
  on_track: {
    label: "On track",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  at_risk: {
    label: "At risk",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  delayed: {
    label: "Delayed",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  completed: {
    label: "Completed",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
};

const activityToneClass = {
  neutral: "bg-slate-100 text-slate-600",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
};

function getStepIcon(status: ProjectStepStatus) {
  if (status === "complete") return CheckCircle2;
  if (status === "current") return Clock3;
  if (status === "blocked") return AlertTriangle;
  return CalendarClock;
}

function getStepClasses(status: ProjectStepStatus) {
  if (status === "complete") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "current") return "border-primary/25 bg-primary-subtle text-primary";
  if (status === "blocked") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-50 text-slate-500";
}

export function ProjectTrackingPanel({
  title = "Project tracker",
  subtitle = "Track execution from posted requirement to final handover.",
  status = "on_track",
  steps = defaultSteps,
  activities = defaultActivities,
  proofs = defaultProofs,
  className,
}: ProjectTrackingPanelProps) {
  const completedCount = steps.filter((step) => step.status === "complete").length;
  const currentWeight = steps.some((step) => step.status === "current") ? 0.6 : 0;
  const progress = Math.min(100, Math.round(((completedCount + currentWeight) / steps.length) * 100));

  return (
    <section className={cn("grid gap-4", className)}>
      <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="enterprise-kicker">Execution control</p>
            <h2 className="mt-1 text-lg font-black tracking-tight text-foreground">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
          </div>
          <span className={cn("inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-black", statusConfig[status].className)}>
            {statusConfig[status].label}
          </span>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-muted-foreground">Milestone progress</span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-sunken">
            <div className={cn("h-full rounded-full bg-gradient-to-r from-secondary to-primary-container transition-all", progressWidthClass(progress))} />
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-6">
          {steps.map((step, index) => {
            const Icon = getStepIcon(step.status);
            return (
              <article key={step.key} className="rounded-lg border border-border-subtle bg-surface-muted p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-full border", getStepClasses(step.status))}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[11px] font-black text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="mt-3 text-sm font-black text-foreground">{step.label}</h3>
                <p className="mt-1 text-[11px] font-bold text-muted-foreground">{step.date || "Pending"}</p>
                {step.description ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{step.description}</p> : null}
              </article>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-foreground">Activity log</h2>
              <p className="mt-1 text-xs text-muted-foreground">Recent project actions and operational updates.</p>
            </div>
            <MessageSquareText className="h-5 w-5 text-primary" />
          </div>

          <div className="space-y-3">
            {activities.map((activity) => (
              <article key={activity.id} className="grid gap-3 rounded-lg border border-border-subtle bg-surface-muted p-3 sm:grid-cols-[36px_1fr_auto] sm:items-start">
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", activityToneClass[activity.tone || "neutral"])}>
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-foreground">{activity.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{activity.detail}</p>
                </div>
                <span className="rounded-md border border-border-subtle bg-surface px-2 py-1 text-[11px] font-bold text-muted-foreground">
                  {activity.time}
                </span>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-foreground">Image proof</h2>
              <p className="mt-1 text-xs text-muted-foreground">Photo evidence from survey, work, and QA checkpoints.</p>
            </div>
            <UploadCloud className="h-5 w-5 text-primary" />
          </div>

          <div className="grid gap-3">
            {proofs.map((proof) => (
              <article key={proof.id} className="overflow-hidden rounded-lg border border-border-subtle bg-surface-muted">
                {proof.imageUrl ? (
                  <img src={proof.imageUrl} alt={proof.title} className="h-32 w-full object-cover" />
                ) : (
                  <div className="flex h-32 items-center justify-center bg-gradient-to-br from-secondary-subtle to-primary-subtle">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-foreground">{proof.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{proof.caption}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-surface px-2 py-1 text-[11px] font-bold text-muted-foreground">
                      {proof.date}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "mt-3 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-black capitalize",
                      proof.status === "verified"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : proof.status === "rejected"
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-amber-200 bg-amber-50 text-amber-700",
                    )}
                  >
                    {proof.status || "pending"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
