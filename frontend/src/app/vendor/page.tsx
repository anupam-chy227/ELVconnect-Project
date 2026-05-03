import Link from "next/link";
import {
  BadgeIndianRupee,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  IndianRupee,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Plus,
  Send,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";
import { DataCard, StatusPill, WorkspaceShell } from "@/components/ELVConnect/WorkspaceShell";
import { Card, PaymentTrustCard, VerificationBadge } from "@/components/ui";
import { projects } from "@/lib/elv-demo-data";

const leads = [
  {
    id: "lead-001",
    title: "16 camera CCTV setup",
    customer: "Apex Auto Parts",
    category: "CCTV",
    location: "Manesar",
    budget: "Rs 2.4L",
    priority: "Hot",
    received: "12 min ago",
  },
  {
    id: "lead-002",
    title: "Fire alarm audit",
    customer: "Northline Warehouse",
    category: "Fire Safety",
    location: "Gurugram",
    budget: "Rs 90K",
    priority: "New",
    received: "34 min ago",
  },
  {
    id: "lead-003",
    title: "Biometric access control",
    customer: "Metro CoWorks",
    category: "Access Control",
    location: "Noida",
    budget: "Rs 1.6L",
    priority: "Review",
    received: "1 hr ago",
  },
];

const visits = [
  { time: "10:30 AM", title: "Factory CCTV survey", location: "Manesar", owner: "Rahul Singh" },
  { time: "01:00 PM", title: "Fire panel inspection", location: "Gurugram", owner: "Imran Khan" },
  { time: "04:15 PM", title: "Access control demo", location: "Noida", owner: "Pooja Mehra" },
];

const milestoneUpdates = [
  { stage: "Survey", project: "Factory CCTV deployment", status: "completed", action: "Upload survey proof" },
  { stage: "Installation", project: "Office structured cabling", status: "in_progress", action: "Update cable testing" },
  { stage: "Testing", project: "Fire NOC readiness", status: "pending", action: "Submit commissioning report" },
];

const amcLeads = [
  { company: "Silverline Mall", scope: "CCTV + fire alarm AMC", value: "Rs 1.8L/year", renewal: "Due in 9 days" },
  { company: "Urban Edge Offices", scope: "Access control AMC", value: "Rs 72K/year", renewal: "Due in 18 days" },
  { company: "Veda Logistics", scope: "Networking support AMC", value: "Rs 1.2L/year", renewal: "New enquiry" },
];

function SectionCard({
  title,
  caption,
  children,
  action,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card title={title} description={caption} action={action}>
      {children}
    </Card>
  );
}

export default function VendorDashboardPage() {
  return (
    <WorkspaceShell
      title="Vendor Dashboard"
      subtitle="Manage new leads, site visits, quotes, ongoing work, milestone updates, and AMC opportunities."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/vendor/agreement" className="inline-flex items-center gap-1.5 rounded-md bg-primary-container px-3 py-2 text-xs font-bold text-on-primary shadow-sm">
            <FileText className="h-4 w-4" />
            Vendor Agreement
          </Link>
          <Link href="/vendor/onboarding" className="inline-flex items-center gap-1.5 rounded-md border border-primary/25 bg-white px-3 py-2 text-xs font-bold text-primary shadow-sm">
            <Plus className="h-4 w-4" />
            Vendor Onboarding
          </Link>
        </div>
      }
    >
      <section className="grid gap-3 md:grid-cols-4">
        <DataCard title="New Leads" value="18" caption="5 high priority" icon={Mail} />
        <DataCard title="Active Projects" value="6" caption="Across Delhi NCR" icon={Briefcase} />
        <DataCard title="Earnings" value="Rs 4.8L" caption="This month booked" icon={IndianRupee} />
        <DataCard title="Rating" value="4.7" caption="From 126 reviews" icon={Star} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card variant="glass">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase text-primary">Vendor trust layer</p>
              <h2 className="mt-2 text-xl font-black text-foreground">Lead quality, compliance proof, and payment readiness stay visible.</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <VerificationBadge level="verified" label="Vendor verified" />
              <VerificationBadge level="escrow" label="Milestone payouts" />
              <VerificationBadge level="kyc" score={94} />
            </div>
          </div>
        </Card>
        <PaymentTrustCard amount="Rs 96K pending" method="upi" status="Payout unlocks after proof and client milestone approval." />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Lead Inbox"
          caption="Fresh customer requirements ranked by urgency, budget fit, and service location."
          action={<StatusPill status="approved" />}
        >
          <div className="grid gap-3">
            {leads.map((lead) => (
              <article key={lead.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-950">{lead.title}</h3>
                      <span className="rounded-full bg-primary-container/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                        {lead.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{lead.customer} - {lead.category}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {lead.location}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1">
                        <BadgeIndianRupee className="h-3.5 w-3.5" />
                        {lead.budget}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {lead.received}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-md bg-primary-container px-3 py-2 text-xs font-bold text-on-primary">Accept Lead</button>
                    <button className="rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">View Details</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Site Visit Calendar" caption="Today schedule for surveys, audits, and client meetings.">
          <div className="grid gap-3">
            {visits.map((visit) => (
              <div key={`${visit.time}-${visit.title}`} className="grid grid-cols-[74px_1fr] gap-3 rounded-lg border border-slate-200 p-3">
                <div className="rounded-md bg-primary-container/10 p-2 text-center">
                  <CalendarClock className="mx-auto h-4 w-4 text-primary" />
                  <p className="mt-1 text-[11px] font-bold text-primary">{visit.time}</p>
                </div>
                <div>
                  <p className="text-sm font-bold">{visit.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{visit.location} - Assigned to {visit.owner}</p>
                  <div className="mt-2 flex gap-2">
                    <button className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700">Reschedule</button>
                    <button className="rounded-md border border-primary/25 px-2 py-1 text-[11px] font-bold text-primary">Start Visit</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Quote Submission Form" caption="Create a fast commercial quote with BOQ and timeline.">
          <form className="grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Select lead</span>
              <select className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold outline-none focus:border-primary">
                {leads.map((lead) => (
                  <option key={lead.id}>{lead.title} - {lead.customer}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-600">Quote amount</span>
                <input aria-label="Quote amount" className="rounded-md border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-600">Delivery timeline</span>
                <input aria-label="Delivery timeline" className="rounded-md border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary" />
              </label>
            </div>
            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">BOQ details</span>
              <textarea
                className="min-h-24 rounded-md border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary"
                aria-label="BOQ details"
              />
            </label>
            <button type="button" className="inline-flex w-fit items-center gap-1.5 rounded-md bg-primary-container px-3 py-2 text-xs font-bold text-on-primary shadow-sm">
              <Send className="h-4 w-4" />
              Submit Quote
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Ongoing Project List" caption="Active delivery pipeline with customer-facing project tracker links.">
          <div className="grid gap-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/project/${project.id}`} className="rounded-lg border border-slate-200 p-3 transition hover:border-primary/40 hover:bg-primary-container/5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold">{project.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{project.location} - {project.budget}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold">{project.progress}%</span>
                    <StatusPill status={project.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Milestone Update Panel" caption="Update proof, completion status, and next customer-visible action.">
          <div className="grid gap-3">
            {milestoneUpdates.map((milestone) => (
              <div key={`${milestone.project}-${milestone.stage}`} className="rounded-lg border border-slate-200 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold">{milestone.stage}</p>
                    <p className="mt-1 text-xs text-slate-500">{milestone.project}</p>
                  </div>
                  <StatusPill status={milestone.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">
                    <FileText className="h-4 w-4" />
                    {milestone.action}
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-primary/25 px-3 py-2 text-xs font-bold text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Updated
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="AMC Leads"
          caption="Recurring maintenance opportunities for vendors with strong service records."
          action={<span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">3 open</span>}
        >
          <div className="grid gap-3">
            {amcLeads.map((lead) => (
              <article key={lead.company} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-start gap-3">
                  <span className="rounded-md bg-primary-container/10 p-2 text-primary">
                    <Wrench className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-sm font-bold">{lead.company}</h3>
                        <p className="mt-1 text-xs text-slate-500">{lead.scope}</p>
                      </div>
                      <p className="text-xs font-bold text-primary">{lead.value}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{lead.renewal}</span>
                      <button className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700">
                        <Phone className="h-3.5 w-3.5" />
                        Contact
                      </button>
                      <button className="inline-flex items-center gap-1.5 rounded-md border border-primary/25 px-2 py-1 text-[11px] font-bold text-primary">
                        <MessageSquareText className="h-3.5 w-3.5" />
                        Send Proposal
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      </section>

      <Card>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="mt-2 text-sm font-bold">Compliance Ready</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">Keep certificates, reports, and visit proofs updated for faster approvals.</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <h3 className="mt-2 text-sm font-bold">Lead Quality</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">Prioritize hot leads with budget clarity, location fit, and uploaded drawings.</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <IndianRupee className="h-5 w-5 text-primary" />
            <h3 className="mt-2 text-sm font-bold">Payment Milestones</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">Submit proof on time to unlock admin-approved milestone payments.</p>
          </div>
        </div>
      </Card>
    </WorkspaceShell>
  );
}
