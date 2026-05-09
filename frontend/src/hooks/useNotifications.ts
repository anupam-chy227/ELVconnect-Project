"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { ApiClientError, invoicesAPI, jobsAPI, notificationsAPI, usersAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { AppNotification, Invoice, Job, NotificationType, User } from "@/types/api";

const STORAGE_KEY = "elv_notifications";

type NotificationStore = {
  readIds: string[];
};

function readStore(): NotificationStore {
  if (typeof window === "undefined") {
    return { readIds: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { readIds: [] };
    const parsed = JSON.parse(raw) as Partial<NotificationStore>;
    return { readIds: Array.isArray(parsed.readIds) ? parsed.readIds : [] };
  } catch {
    return { readIds: [] };
  }
}

function writeStore(readIds: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ readIds: Array.from(readIds) }));
}

function getServiceProvider(user?: User) {
  return user?.serviceProvider ?? user?.profile.serviceProvider;
}

function getJobTitle(job?: Job) {
  return job?.title?.trim() || "your ELV project";
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function createNotification(
  type: NotificationType,
  id: string,
  message: string,
  href?: string,
  reason?: string,
): AppNotification {
  return {
    id,
    type,
    message,
    href,
    reason,
    createdAt: new Date().toISOString(),
    unread: true,
  };
}

function applyReadState(notification: AppNotification, readIds: Set<string>): AppNotification {
  return {
    ...notification,
    unread: notification.unread !== false && !readIds.has(notification.id),
  };
}

function isNotFound(error: unknown) {
  return error instanceof ApiClientError && error.status === 404;
}

export function useNotifications() {
  const canPoll = typeof window !== "undefined" && Boolean(getToken());
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set(readStore().readIds));
  const [derivedNotifications, setDerivedNotifications] = useState<AppNotification[]>([]);
  const previousJobsRef = useRef<Job[] | null>(null);
  const previousInvoicesRef = useRef<Invoice[] | null>(null);

  const backendResult = useSWR<AppNotification[]>(canPoll ? "/notifications" : null, notificationsAPI.getNotifications, {
    refreshInterval: 60000,
    shouldRetryOnError: false,
  });
  const jobsResult = useSWR<Job[]>(canPoll ? "notifications:/jobs/my" : null, jobsAPI.getMyJobs, {
    refreshInterval: 60000,
    shouldRetryOnError: false,
  });
  const invoicesResult = useSWR<Invoice[]>(canPoll ? "notifications:/invoices" : null, invoicesAPI.getMyInvoices, {
    refreshInterval: 60000,
    shouldRetryOnError: false,
  });
  const profileResult = useSWR<User>(canPoll ? "notifications:/users/me" : null, usersAPI.getMyProfile, {
    refreshInterval: 60000,
    shouldRetryOnError: false,
  });

  useEffect(() => {
    const jobs = jobsResult.data;
    if (!jobs) return;

    const previousJobs = previousJobsRef.current;
    previousJobsRef.current = jobs;

    if (!previousJobs) return;

    const previousById = new Map(previousJobs.map((job) => [job._id, job]));
    const updates = jobs.flatMap((job) => {
      const previous = previousById.get(job._id);
      if (!previous) return [];

      const nextNotifications: AppNotification[] = [];
      if (job.applicantCount > previous.applicantCount) {
        nextNotifications.push(
          createNotification(
            "new_application",
            `job-${job._id}-applications-${job.applicantCount}`,
            `New application for ${getJobTitle(job)}`,
            `/dashboard/customer/jobs/${job._id}/applications`,
          ),
        );
      }

      if (
        job.status === "assigned" &&
        previous.status !== "assigned" &&
        job.assignedEngineerId
      ) {
        nextNotifications.push(
          createNotification(
            "job_assigned",
            `job-${job._id}-assigned-${job.assignedEngineerId}`,
            `You've been assigned to ${getJobTitle(job)}`,
            `/dashboard/engineer`,
          ),
        );
      }

      return nextNotifications;
    });

    if (updates.length) {
      setDerivedNotifications((current) => [...updates, ...current].slice(0, 30));
    }
  }, [jobsResult.data]);

  useEffect(() => {
    const invoices = invoicesResult.data;
    if (!invoices) return;

    const previousInvoices = previousInvoicesRef.current;
    previousInvoicesRef.current = invoices;

    if (!previousInvoices) return;

    const previousById = new Map(previousInvoices.map((invoice) => [invoice._id, invoice]));
    const updates = invoices.flatMap((invoice) => {
      const previous = previousById.get(invoice._id);

      if (!previous) {
        return [
          createNotification(
            "invoice_created",
            `invoice-${invoice._id}-created`,
            `Invoice ${formatCurrency(invoice.amount)} created for ${invoice.job?.title ?? invoice.milestone}`,
            `/dashboard/customer/payments`,
          ),
        ];
      }

      if (previous.status !== invoice.status) {
        return [
          createNotification(
            "invoice_created",
            `invoice-${invoice._id}-${invoice.status}`,
            `Invoice ${formatCurrency(invoice.amount)} is now ${invoice.status.replace("_", " ")}`,
            `/dashboard/customer/payments`,
          ),
        ];
      }

      return [];
    });

    if (updates.length) {
      setDerivedNotifications((current) => [...updates, ...current].slice(0, 30));
    }
  }, [invoicesResult.data]);

  const verificationNotification = useMemo<AppNotification | null>(() => {
    const provider = getServiceProvider(profileResult.data);
    const status = provider?.verificationStatus;
    const userId = profileResult.data?._id ?? "me";

    if (status === "verified") {
      return {
        ...createNotification(
          "verification_approved",
          `verification-${userId}-approved`,
          "Your verification was approved!",
          "/dashboard/engineer",
        ),
        createdAt: profileResult.data?.updatedAt ?? new Date().toISOString(),
      };
    }

    if (status === "rejected") {
      return {
        ...createNotification(
          "verification_rejected",
          `verification-${userId}-rejected`,
          "Verification rejected. Please review your documents.",
          "/dashboard/engineer/verification",
          "Please review your documents.",
        ),
        createdAt: profileResult.data?.updatedAt ?? new Date().toISOString(),
      };
    }

    return null;
  }, [profileResult.data]);

  const backendAvailable = Boolean(backendResult.data) && !isNotFound(backendResult.error);
  const sourceNotifications = useMemo(
    () =>
      backendAvailable
        ? backendResult.data ?? []
        : verificationNotification
          ? [verificationNotification, ...derivedNotifications]
          : derivedNotifications,
    [backendAvailable, backendResult.data, derivedNotifications, verificationNotification],
  );

  const notifications = useMemo(
    () =>
      sourceNotifications
        .map((notification) => applyReadState(notification, readIds))
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
        .slice(0, 20),
    [readIds, sourceNotifications],
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications],
  );

  const markAllAsRead = useCallback(() => {
    setReadIds((current) => {
      const next = new Set(current);
      notifications.forEach((notification) => next.add(notification.id));
      writeStore(next);
      return next;
    });
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    isLoading: backendResult.isLoading || jobsResult.isLoading || invoicesResult.isLoading,
    error: isNotFound(backendResult.error) ? undefined : backendResult.error,
  };
}
