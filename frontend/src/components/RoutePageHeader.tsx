"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type PageHeaderContent = {
  title: string;
  description: string;
  cta: {
    label: "Apply" | "Browse Jobs";
    href: string;
  };
};

const browseJobsCta = {
  label: "Browse Jobs" as const,
  href: "/jobs",
};

const exactRouteHeaders: Record<string, PageHeaderContent> = {
  "/": {
    title: "ELV Connect",
    description: "Find verified ELV engineers, browse trusted jobs, and manage security infrastructure work with clear project context.",
    cta: browseJobsCta,
  },
  "/services": {
    title: "ELV Services",
    description: "Explore CCTV, fire safety, access control, networking, and AMC services delivered by verified infrastructure specialists.",
    cta: browseJobsCta,
  },
  "/engineers": {
    title: "Verified ELV Engineers",
    description: "Browse vetted professionals by skill, city, availability, trust score, and delivery history before you start work.",
    cta: browseJobsCta,
  },
  "/jobs": {
    title: "Browse ELV Jobs",
    description: "Compare open security infrastructure requirements by category, city, budget, urgency, and verified client context.",
    cta: browseJobsCta,
  },
  "/post-requirement": {
    title: "Post Requirement",
    description: "Share scope, location, timelines, and budget so verified engineers can quote with fewer delays and cleaner expectations.",
    cta: browseJobsCta,
  },
  "/matches": {
    title: "Verified Matches",
    description: "Review recommended engineers and vendors based on job scope, trust signals, city coverage, and operational fit.",
    cta: browseJobsCta,
  },
  "/trust-safety": {
    title: "Trust & Safety",
    description: "Understand how ELV Connect protects projects with verification, structured workflows, escrow-ready payments, and audit trails.",
    cta: browseJobsCta,
  },
  "/city-directory": {
    title: "City Directory",
    description: "Explore ELV demand, vendor coverage, and service readiness across major Indian cities and operating zones.",
    cta: browseJobsCta,
  },
  "/login": {
    title: "Sign In",
    description: "Access your ELV Connect workspace to manage jobs, applications, invoices, projects, and verification tasks.",
    cta: browseJobsCta,
  },
  "/auth/login": {
    title: "Sign In",
    description: "Access your ELV Connect workspace to continue secure infrastructure work without losing operational context.",
    cta: browseJobsCta,
  },
  "/register": {
    title: "Create Account",
    description: "Join ELV Connect as a client or verified engineer and start managing ELV work through a structured workflow.",
    cta: browseJobsCta,
  },
  "/auth/google/callback": {
    title: "Completing Sign In",
    description: "We are validating your Google session and routing you to the right ELV Connect workspace.",
    cta: browseJobsCta,
  },
  "/vendor": {
    title: "Vendor Workbench",
    description: "Manage leads, service coverage, compliance readiness, agreements, and delivery signals for ELV vendor operations.",
    cta: browseJobsCta,
  },
  "/vendor/onboarding": {
    title: "Vendor Onboarding",
    description: "Complete company, compliance, service, and review details needed to qualify for trusted ELV delivery.",
    cta: browseJobsCta,
  },
  "/vendor/agreement": {
    title: "Vendor Agreement",
    description: "Review commercial terms, responsibilities, payout rules, and operating commitments before activating vendor work.",
    cta: browseJobsCta,
  },
  "/dashboard": {
    title: "Dashboard",
    description: "Track ELV projects, applications, invoices, engineers, and operational risk from one reliable workspace.",
    cta: browseJobsCta,
  },
  "/dashboard/jobs": {
    title: "My Jobs",
    description: "Review posted work, project progress, applicant activity, and status changes across active ELV requirements.",
    cta: browseJobsCta,
  },
  "/dashboard/jobs/create": {
    title: "Create Job",
    description: "Define a clear ELV work order with scope, budget, location, and timeline so engineers can respond accurately.",
    cta: browseJobsCta,
  },
  "/dashboard/applications": {
    title: "Applications",
    description: "Manage submitted proposals, shortlist decisions, and application status for active ELV jobs.",
    cta: browseJobsCta,
  },
  "/dashboard/engineers": {
    title: "Dashboard Engineers",
    description: "Browse and compare verified engineers available for your projects, service areas, and ELV categories.",
    cta: browseJobsCta,
  },
  "/dashboard/invoices": {
    title: "Invoices",
    description: "Review billing status, outstanding balances, invoice activity, and payment readiness across your projects.",
    cta: browseJobsCta,
  },
  "/dashboard/invoices/create": {
    title: "Create Invoice",
    description: "Generate a structured invoice with line items, taxes, due dates, and payment context for ELV work.",
    cta: browseJobsCta,
  },
  "/dashboard/payments": {
    title: "Payments",
    description: "Monitor payment collection, escrow readiness, payout status, and settlement signals with clear financial context.",
    cta: browseJobsCta,
  },
  "/dashboard/profile": {
    title: "Profile Settings",
    description: "Keep company, contact, verification, and notification details accurate for smoother project delivery.",
    cta: browseJobsCta,
  },
  "/dashboard/client": {
    title: "Client Dashboard",
    description: "Manage requirements, project milestones, AMC coverage, agreements, payments, and engineer coordination.",
    cta: browseJobsCta,
  },
  "/dashboard/client/post-job": {
    title: "Post Client Job",
    description: "Create a project-ready ELV requirement with scope, site details, urgency, and budget guardrails.",
    cta: browseJobsCta,
  },
  "/dashboard/client/projects": {
    title: "Client Projects",
    description: "Track active ELV projects, milestones, vendor coordination, QA proof, and delivery risk from one view.",
    cta: browseJobsCta,
  },
  "/dashboard/client/amc": {
    title: "Client AMC",
    description: "Manage maintenance contracts, visit schedules, renewal windows, and service coverage for ELV assets.",
    cta: browseJobsCta,
  },
  "/dashboard/client/payments": {
    title: "Client Payments",
    description: "Review invoices, payment status, release decisions, and transaction context for client-side work.",
    cta: browseJobsCta,
  },
  "/dashboard/client/agreement": {
    title: "Client Agreement",
    description: "Prepare agreement terms, scope details, payment schedules, and approval checkpoints before execution.",
    cta: browseJobsCta,
  },
  "/client": {
    title: "Client Dashboard",
    description: "Manage requirements, project milestones, AMC coverage, agreements, payments, and engineer coordination.",
    cta: browseJobsCta,
  },
  "/client/post-job": {
    title: "Post Client Job",
    description: "Create a project-ready ELV requirement with scope, site details, urgency, and budget guardrails.",
    cta: browseJobsCta,
  },
  "/client/projects": {
    title: "Client Projects",
    description: "Track active ELV projects, milestones, vendor coordination, QA proof, and delivery risk from one view.",
    cta: browseJobsCta,
  },
  "/client/amc": {
    title: "Client AMC",
    description: "Manage maintenance contracts, visit schedules, renewal windows, and service coverage for ELV assets.",
    cta: browseJobsCta,
  },
  "/client/payments": {
    title: "Client Payments",
    description: "Review invoices, payment status, release decisions, and transaction context for client-side work.",
    cta: browseJobsCta,
  },
  "/dashboard/customer": {
    title: "Customer Dashboard",
    description: "Manage posted jobs, shortlisted engineers, active workstreams, AMC coverage, and payment release decisions.",
    cta: browseJobsCta,
  },
  "/dashboard/customer/jobs": {
    title: "Customer Jobs",
    description: "Review every customer job by status, category, budget, applicants, and delivery progress.",
    cta: browseJobsCta,
  },
  "/dashboard/customer/post-job": {
    title: "Post Customer Job",
    description: "Capture structured site, category, scope, and budget details so verified engineers can respond with confidence.",
    cta: browseJobsCta,
  },
  "/dashboard/customer/amc": {
    title: "Customer AMC",
    description: "Track annual maintenance contracts, visits, renewals, and assigned engineers across ELV assets.",
    cta: browseJobsCta,
  },
  "/dashboard/customer/payments": {
    title: "Customer Payments",
    description: "Review invoices, releases, payment history, and dispute context before making financial decisions.",
    cta: browseJobsCta,
  },
  "/dashboard/engineer": {
    title: "Engineer Dashboard",
    description: "Discover nearby ELV work, apply with clear proposals, track active jobs, and manage verification readiness.",
    cta: {
      label: "Apply",
      href: "/jobs",
    },
  },
  "/dashboard/engineer/jobs": {
    title: "Engineer Jobs",
    description: "Find open jobs that match your ELV categories, city coverage, availability, and budget expectations.",
    cta: {
      label: "Apply",
      href: "/jobs",
    },
  },
  "/dashboard/engineer/earnings": {
    title: "Engineer Earnings",
    description: "Track invoices, payouts, AMC revenue, payment timing, and financial performance for completed work.",
    cta: {
      label: "Apply",
      href: "/jobs",
    },
  },
  "/dashboard/engineer/verification": {
    title: "Engineer Verification",
    description: "Complete documents, categories, business details, and trust checks needed to qualify for better work.",
    cta: {
      label: "Apply",
      href: "/jobs",
    },
  },
  "/engineer": {
    title: "Engineer Dashboard",
    description: "Discover nearby ELV work, apply with clear proposals, track active jobs, and manage verification readiness.",
    cta: {
      label: "Apply",
      href: "/jobs",
    },
  },
  "/engineer/jobs": {
    title: "Engineer Jobs",
    description: "Find open jobs that match your ELV categories, city coverage, availability, and budget expectations.",
    cta: {
      label: "Apply",
      href: "/jobs",
    },
  },
  "/engineer/earnings": {
    title: "Engineer Earnings",
    description: "Track invoices, payouts, AMC revenue, payment timing, and financial performance for completed work.",
    cta: {
      label: "Apply",
      href: "/jobs",
    },
  },
  "/engineer/verification": {
    title: "Engineer Verification",
    description: "Complete documents, categories, business details, and trust checks needed to qualify for better work.",
    cta: {
      label: "Apply",
      href: "/jobs",
    },
  },
  "/dashboard/admin": {
    title: "Dashboard Admin",
    description: "Review dashboard-level controls, protected admin access, and operational navigation for ELV Connect.",
    cta: browseJobsCta,
  },
  "/admin": {
    title: "Admin Console",
    description: "Monitor platform health, vendors, projects, payments, QA signals, city demand, and operating risk.",
    cta: browseJobsCta,
  },
  "/admin/dashboard": {
    title: "Admin Dashboard",
    description: "Review live marketplace health, revenue signals, risk queues, vendor performance, and operational exceptions.",
    cta: browseJobsCta,
  },
  "/admin/projects": {
    title: "Admin Projects",
    description: "Track project delivery, milestone risk, proof status, delays, and escalation signals across the marketplace.",
    cta: browseJobsCta,
  },
  "/admin/vendors": {
    title: "Admin Vendors",
    description: "Review vendor quality, verification state, category strength, city coverage, and compliance risk.",
    cta: browseJobsCta,
  },
  "/admin/payments": {
    title: "Admin Payments",
    description: "Audit payments, settlements, suspicious activity, invoice status, and revenue movement with confidence.",
    cta: browseJobsCta,
  },
  "/admin/qa-audit": {
    title: "QA Audit",
    description: "Inspect proof quality, site readiness, SLA adherence, safety evidence, and audit exceptions.",
    cta: browseJobsCta,
  },
  "/admin/ai-insights": {
    title: "AI Insights",
    description: "Use forecast signals, anomaly patterns, category demand, and vendor risk scoring to guide decisions.",
    cta: browseJobsCta,
  },
  "/admin/reports": {
    title: "Admin Reports",
    description: "Generate operational, financial, vendor, and marketplace reports for leadership review and follow-up.",
    cta: browseJobsCta,
  },
  "/admin/city-insights": {
    title: "City Insights",
    description: "Compare city-level demand, vendor density, project flow, and opportunity gaps across ELV categories.",
    cta: browseJobsCta,
  },
  "/admin/audit": {
    title: "Audit Log",
    description: "Review sensitive platform activity, administrative changes, and operational events that need accountability.",
    cta: browseJobsCta,
  },
  "/admin/verification-queue": {
    title: "Verification Queue",
    description: "Prioritize engineer and vendor verification reviews using trust, document, and category readiness signals.",
    cta: browseJobsCta,
  },
};

function normalizePath(pathname: string | null) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

function titleCaseFromSlug(value: string) {
  return decodeURIComponent(value)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getDynamicHeader(pathname: string): PageHeaderContent | null {
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments.at(-1) ?? "";

  if (pathname.startsWith("/categories/")) {
    const category = titleCaseFromSlug(lastSegment);
    return {
      title: `${category} Specialists`,
      description: `Review trusted ${category.toLowerCase()} job demand, engineer availability, city coverage, and service guidance.`,
      cta: browseJobsCta,
    };
  }

  if (pathname.startsWith("/jobs/")) {
    return {
      title: "Review Job Requirement",
      description: "Check scope, budget, location, timeline, and trust context before submitting a clear ELV proposal.",
      cta: {
        label: "Apply",
        href: `${pathname}#quote`,
      },
    };
  }

  if (pathname.startsWith("/engineers/")) {
    return {
      title: "Engineer Profile",
      description: "Review verification status, categories, rating, city coverage, work history, and trust signals before hiring.",
      cta: browseJobsCta,
    };
  }

  if (pathname.startsWith("/vendor/")) {
    return {
      title: "Vendor Profile",
      description: "Review service categories, compliance posture, coverage area, certifications, and delivery performance.",
      cta: browseJobsCta,
    };
  }

  if (pathname.startsWith("/project/")) {
    return {
      title: "Project Tracker",
      description: "Track milestones, vendor progress, payment checkpoints, site activity, and proof status for the selected project.",
      cta: browseJobsCta,
    };
  }

  if (pathname.startsWith("/dashboard/invoices/")) {
    return {
      title: "Invoice Details",
      description: "Review invoice line items, payment progress, due dates, balances, and project billing context.",
      cta: browseJobsCta,
    };
  }

  if (pathname.startsWith("/dashboard/customer/jobs/")) {
    return {
      title: pathname.endsWith("/applications") ? "Job Applications" : "Customer Job Details",
      description: pathname.endsWith("/applications")
        ? "Compare engineer proposals, shortlist candidates, and move customer work toward reliable execution."
        : "Review job scope, applicants, project status, budget, and operational context for customer work.",
      cta: browseJobsCta,
    };
  }

  if (pathname.startsWith("/admin/")) {
    const title = titleCaseFromSlug(lastSegment);
    return {
      title,
      description: "Review platform operations, trust signals, risk indicators, and marketplace activity from the admin console.",
      cta: browseJobsCta,
    };
  }

  return null;
}

function getHeaderContent(pathname: string): PageHeaderContent {
  return exactRouteHeaders[pathname] ?? getDynamicHeader(pathname) ?? {
    title: titleCaseFromSlug(pathname.split("/").filter(Boolean).at(-1) ?? "ELV Connect"),
    description: "Use this ELV Connect page to move infrastructure work forward with clearer context and reliable next actions.",
    cta: browseJobsCta,
  };
}

export default function RoutePageHeader() {
  const pathname = normalizePath(usePathname());

  if (pathname === "/" || pathname === "/register") {
    return null;
  }

  const { title, description, cta } = getHeaderContent(pathname);

  return (
    <section className="border-b border-slate-200/70 bg-white/90 shadow-sm shadow-slate-950/[0.02] dark:border-slate-800/70 dark:bg-slate-950/90">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-slate-950 dark:text-white">{title}</h1>
            <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">{description}</p>
          </div>
          <Link
            href={cta.href}
            className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-sm shadow-primary/20 transition hover:bg-primary-container focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring md:w-auto"
          >
            {cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
