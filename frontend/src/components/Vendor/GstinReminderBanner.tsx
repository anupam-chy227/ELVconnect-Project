"use client";

import Link from "next/link";
import { TableProperties } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/components/ui/utils";

type GstinReminderBannerProps = {
  className?: string;
  gstNumber?: string | null;
  shouldShow?: boolean;
};

export function GstinReminderBanner({ className, gstNumber, shouldShow }: GstinReminderBannerProps) {
  const { user, isLoading } = useAuth();
  const resolvedGstin = gstNumber ?? user?.serviceProvider?.gstNumber;
  const hasGstin = Boolean(resolvedGstin?.trim());
  const isServiceProvider = user?.role === "service_provider" || shouldShow === true;

  if ((isLoading && shouldShow !== true) || hasGstin || !isServiceProvider) {
    return null;
  }

  return (
    <section
      role="alert"
      aria-labelledby="gstin-reminder-title"
      className={cn(
        "overflow-hidden rounded-lg border border-white/10 bg-[#103b70] px-4 py-3 text-white shadow-lg shadow-blue-950/20",
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl items-start gap-3">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/25 bg-white/10 text-white">
          <TableProperties className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id="gstin-reminder-title" className="text-sm font-black leading-5 sm:text-base">
            Please provide your GSTIN
          </h2>
          <p className="mt-1 max-w-5xl text-sm font-semibold leading-6 text-blue-50">
            As per Indian government regulations, freelancers are required to provide GST details for Tax Collected at Source (TCS) purposes.{" "}
            <a
              href="https://www.gst.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="font-black text-white underline decoration-white/70 underline-offset-2 transition hover:decoration-white"
            >
              Learn more
            </a>
          </p>
          <Link
            href="/dashboard/engineer/verification"
            className="mt-1 inline-flex text-sm font-black text-white underline decoration-white/70 underline-offset-2 transition hover:decoration-white"
          >
            Update your GSTIN
          </Link>
        </div>
      </div>
    </section>
  );
}
