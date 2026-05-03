"use client";

import useSWR from "swr";
import { getExternalJson } from "@/lib/api";

export type LivePulseStats = {
  engineersOnline: number;
  jobsPostedToday: number;
  completedToday: number;
  citiesActive: number;
};

export type UseLivePulseOptions = {
  endpoint?: string;
  refreshInterval?: number;
  fallbackData?: LivePulseStats;
};

const defaultStats: LivePulseStats = {
  engineersOnline: 247,
  jobsPostedToday: 56,
  completedToday: 18,
  citiesActive: 12,
};

async function fetcher(url: string): Promise<LivePulseStats> {
  return getExternalJson<LivePulseStats>(url);
}

export function useLivePulse({
  endpoint,
  refreshInterval = 30000,
  fallbackData = defaultStats,
}: UseLivePulseOptions = {}) {
  const { data, error, isLoading, mutate } = useSWR(endpoint ?? null, fetcher, {
    refreshInterval,
    fallbackData,
    keepPreviousData: true,
  });

  return {
    data: data ?? fallbackData,
    error,
    isLoading,
    refresh: mutate,
  };
}
