import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  ImageIcon,
  IndianRupee,
  MessageSquareWarning,
  Milestone,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { DataCard, StatusPill, WorkspaceShell } from "@/components/ELVConnect/WorkspaceShell";
import { projects } from "@/lib/elv-demo-data";
import { cn, progressWidthClass } from "@/components/ui/utils";

const statusTimeline = [
  {
    label: "Requirement posted",
    date: "12 Apr",
    detail: "Customer requirement captured with site category, budget, and drawings.",
    status: "completed",
  },
  {
    label: "Site visit scheduled",
    date: "13 Apr",
    detail: "Verified engineer visit confirmed for measurements and BOQ validation.",
    status: "completed",
  },
  {
    label: "Quote received",
    date: "14 Apr",
    detail: "Commercial quote and technical scope received from assigned vendor.",
    status: "completed",
  },
  {
    label: "Work started",
    date: "16 Apr",
    detail: "Installation team mobilized with approved material list and site access.",
    status: "current",
  },
  {
    label: "Testing completed",
    date: "Pending",
    detail: "System testing, commissioning report, and customer validation are pending.",
    status: "pending",
  },
  {
    label: "Handover done",
    date: "Pending",
    detail: "Final documentation, warranty files, and training handover will close the job.",
    status: "pending",
  },
];

const proofCards = [
  {
    title: "Site survey proof",
    date: "13 Apr",
    caption: "Entry gate, camera points, cable route, and control room captured.",
    tone: "from-sky-100 to-indigo-100",
  },
  {
    title: "Material dispatch",
    date: "15 Apr",
    caption: "NVR, PoE switches, conduit, and mounting kits verified before dispatch.",
    tone: "from-emerald-100 to-teal-100",
  },
  {
    title: "Installation progress",
    date: "18 Apr",
    caption: "First-floor camera mounting and rack dressing completed.",
    tone: "from-violet-100 to-fuchsia-100",
  },
];

const documents = [
  { name: "Approved BOQ", type: "PDF", owner: "Vendor", status: "verified" },
  { name: "Site survey report", type: "PDF", owner: "Engineer", status: "verified" },
  { name: "Installation drawing", type: "DWG", owner: "Ops", status: "pending" },
  { name: "Warranty certificate", type: "PDF", owner: "Vendor", status: "pending" },
];

const progressMilestones = [
  { label: "Requirement", value: 100 },
  { label: "Visit", value: 100 },
  { label: "Quote", value: 100 },
  { label: "Install", value: 60 },
  { label: "Testing", value: 0 },
  { label: "Handover", value: 0 },
];

export default function ProjectTrackerPage({ params }: { params: { id: string } }) {
  const project = projects.find((item) => item.id === params.id) || projects[0];
  const completedSteps = statusTimeline.filter((item) => item.status === "completed").length;
  const totalSteps = statusTimeline.length;
  const projectProgress = Math.round(((completedSteps + 0.6) / totalSteps) * 100);

  return (
    <WorkspaceShell
      title={project.title}
      subtitle={`${project.category} project in ${project.location} with milestone, document, and payment tracking.`}
      actions={
        <button className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700">
          <MessageSquareWarning className="h-4 w-4" />
          Raise Issue
        </button>
      }
    >
      <section className="grid gap-3 md:grid-cols-3">
        <DataCard title="Budget" value={project.budget} caption="Customer approved" icon={IndianRupee} />
        <DataCard title="Progress" value={`${projectProgress}%`} caption="Milestone completion" icon={Milestone} />
        <DataCard title="Document Vault" value={String(documents.length)} caption="Reports, drawings, warranty" icon={FileText} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Live project status</p>
            <h2 className="mt-1 text-lg font-bold">Milestone Progress</h2>
            <p className="mt-1 text-xs text-slate-500">
              {completedSteps} of {totalSteps} stages completed. Current owner: {project.vendor}.
            </p>
          </div>
          <StatusPill status={project.status} />
        </div>

        <div className="mt-5">
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div className={cn("h-full rounded-full bg-primary-container transition-all", progressWidthClass(projectProgress))} />
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-6">
            {progressMilestones.map((milestone) => (
              <div key={milestone.label} className="rounded-md border border-slate-200 bg-slate-50 p-2">
                <p className="text-[11px] font-bold text-slate-700">{milestone.label}</p>
                <p className="mt-1 text-xs text-slate-500">{milestone.value}% done</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Project Status Timeline</h2>
              <p className="mt-1 text-xs text-slate-500">Client-facing activity trail from requirement to handover.</p>
            </div>
            <CalendarCheck className="h-5 w-5 text-primary" />
          </div>

          <div className="space-y-3">
            {statusTimeline.map((item, index) => {
              const isCompleted = item.status === "completed";
              const isCurrent = item.status === "current";
              const Icon = isCompleted ? CheckCircle2 : isCurrent ? Clock3 : AlertTriangle;

              return (
                <div
                  key={item.label}
                  className="grid gap-3 rounded-lg border border-slate-200 p-3 md:grid-cols-[38px_1fr_auto] md:items-start"
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-700"
                        : isCurrent
                          ? "bg-primary-container/10 text-primary"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-slate-950">{item.label}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                        Step {index + 1}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                  </div>
                  <span className="rounded-md border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Photo Proof</h2>
              <p className="mt-1 text-xs text-slate-500">Verified images uploaded by field teams.</p>
            </div>
            <UploadCloud className="h-5 w-5 text-primary" />
          </div>

          <div className="grid gap-3">
            {proofCards.map((proof) => (
              <article key={proof.title} className="overflow-hidden rounded-lg border border-slate-200">
                <div className={`flex h-28 items-center justify-center bg-gradient-to-br ${proof.tone}`}>
                  <ImageIcon className="h-8 w-8 text-slate-500" />
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-bold">{proof.title}</h3>
                    <span className="text-[11px] font-bold text-slate-500">{proof.date}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{proof.caption}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="rounded-md bg-white p-2 text-rose-600">
              <MessageSquareWarning className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-rose-950">Issue & Escalation</h2>
              <p className="mt-1 text-xs leading-5 text-rose-700">
                Raise an issue for delayed visit, material mismatch, missing proof, billing dispute, or safety concern.
              </p>
              <button className="mt-4 rounded-md bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700">
                Escalate to Ops Team
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold">Document Vault</h2>
              <p className="mt-1 text-xs text-slate-500">All project documents are stored against this project ID.</p>
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-primary/25 px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary-container/10">
              <UploadCloud className="h-4 w-4" />
              Upload Document
            </button>
          </div>

          <div className="grid gap-2">
            {documents.map((document) => (
              <div
                key={document.name}
                className="grid gap-3 rounded-lg border border-slate-200 p-3 md:grid-cols-[32px_1fr_auto_auto] md:items-center"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-container/10 text-primary">
                  <FileText className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-950">{document.name}</p>
                  <p className="text-xs text-slate-500">
                    {document.type} - Uploaded by {document.owner}
                  </p>
                </div>
                <StatusPill status={document.status} />
                <button className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-primary/40 hover:text-primary">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="mt-2 text-sm font-bold">Quality Gate</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">Testing checklist must be approved before handover.</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="mt-2 text-sm font-bold">Handover Pack</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">Warranty, reports, drawings, and compliance notes are tracked.</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <Milestone className="h-5 w-5 text-primary" />
            <h3 className="mt-2 text-sm font-bold">Next Action</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">Ops team is monitoring installation proof and testing readiness.</p>
          </div>
        </div>
      </section>
    </WorkspaceShell>
  );
}
