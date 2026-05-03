import useSWR, { type KeyedMutator } from "swr";
import { adminAPI, amcAPI, invoicesAPI, jobsAPI, usersAPI } from "@/lib/api";
import type {
  AdminStats,
  AMCContract,
  Application,
  Engineer,
  EngineerDirectoryParams,
  Invoice,
  Job,
  JobFilterParams,
  JobsResponse,
  User,
} from "@/types/api";

export type SWRDataResult<T> = {
  data: T | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: KeyedMutator<T>;
};

export const useMyProfile = (): SWRDataResult<User> => {
  const result = useSWR<User>("/users/me", usersAPI.getMyProfile);
  return result;
};

export const useMyJobs = (): SWRDataResult<Job[]> => {
  const result = useSWR<Job[]>("/jobs/my-jobs", jobsAPI.getMyJobs);
  return result;
};

export const useJobsBoard = (params?: JobFilterParams): SWRDataResult<JobsResponse> => {
  const result = useSWR<JobsResponse>(["/jobs", params], () => jobsAPI.browseJobsBoard(params));
  return result;
};

export const useJobById = (id: string): SWRDataResult<Job> => {
  const result = useSWR<Job>(id ? `/jobs/${id}` : null, () => jobsAPI.getJobById(id));
  return result;
};

export const useEngineerDirectory = (params?: EngineerDirectoryParams): SWRDataResult<Engineer[]> => {
  const result = useSWR<Engineer[]>(["/users/engineers", params], () => usersAPI.getEngineerDirectory(params));
  return result;
};

export const useMyInvoices = (): SWRDataResult<Invoice[]> => {
  const result = useSWR<Invoice[]>("/invoices", invoicesAPI.getMyInvoices);
  return result;
};

export const useMyAMCs = (): SWRDataResult<AMCContract[]> => {
  const result = useSWR<AMCContract[]>("/amc", amcAPI.getMyContracts, {
    shouldRetryOnError: false,
  });
  return result;
};

export const useJobsNearMe = (
  lat: number | null,
  lng: number | null,
  radius: number,
): SWRDataResult<Job[]> => {
  const result = useSWR<Job[]>(
    lat !== null && lng !== null ? ["/jobs/near-me", lat, lng, radius] : null,
    () => jobsAPI.searchJobsNearMe(lat ?? 0, lng ?? 0, radius),
  );
  return result;
};

export const useAdminStats = (): SWRDataResult<AdminStats> => {
  const result = useSWR<AdminStats>("/admin/stats", adminAPI.getDashboardStats);
  return result;
};

export const usePendingVerifications = (): SWRDataResult<User[]> => {
  const result = useSWR<User[]>("/admin/verifications/pending", adminAPI.getPendingVerifications);
  return result;
};

export const useMyApplications = (): SWRDataResult<Application[]> => {
  const result = useSWR<Application[]>("/jobs/my-applications", jobsAPI.getMyApplications);
  return result;
};

export const useJobApplications = (jobId: string): SWRDataResult<Application[]> => {
  const result = useSWR<Application[]>(jobId ? `/jobs/${jobId}/applications` : null, () => jobsAPI.getJobApplications(jobId));
  return result;
};
