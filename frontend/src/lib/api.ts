import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import { API_BASE_URL, API_TIMEOUT } from "./config";
import { clearTokens, getRefreshToken, getToken, saveToken, saveTokens } from "./auth";
import type {
  AdminJobParams,
  AdminStats,
  AdminUserParams,
  AMCContract,
  AppNotification,
  Application,
  ApplicationPayload,
  CreateAMCPayload,
  CreateInvoicePayload,
  CreateJobPayload,
  CustomerRegisterPayload,
  Engineer,
  EngineerDirectoryParams,
  EngineerReview,
  EngineerTier,
  Invoice,
  Job,
  JobFilterParams,
  JobsResponse,
  LoginPayload,
  LoginResponse,
  ProviderRegisterPayload,
  QueryParams,
  RefreshResponse,
  User,
  UserProfile,
  VerificationStatus,
} from "@/types/api";

type ApiEnvelope<T> = {
  data?: T;
  message?: string;
  status?: string;
};

type ApiErrorBody = {
  message?: string;
  error?: {
    message?: string;
  };
  errors?: Record<string, string | string[]> | Array<{ field?: string; path?: string; message?: string }>;
};

type RetryRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
};

type LegacyAuthResponse = {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  user: LoginResponse["user"];
};

type LegacyRefreshResponse = {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
};

type UserResponse = User | { user: User };

export class ApiClientError extends Error {
  readonly status?: number;
  readonly validationErrors?: Record<string, string>;

  constructor(message: string, status?: number, validationErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.validationErrors = validationErrors;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapApiData<T>(payload: unknown): T {
  if (isRecord(payload) && "data" in payload) {
    return payload.data as T;
  }

  return payload as T;
}

function getBackendMessage(data: unknown, fallback: string) {
  if (!isRecord(data)) {
    return fallback;
  }

  const directMessage = typeof data.message === "string" ? data.message : undefined;
  const error = isRecord(data.error) ? data.error : undefined;
  const nestedMessage = typeof error?.message === "string" ? error.message : undefined;

  return nestedMessage ?? directMessage ?? fallback;
}

function normalizeValidationErrors(errors: ApiErrorBody["errors"]): Record<string, string> | undefined {
  if (!errors) {
    return undefined;
  }

  if (Array.isArray(errors)) {
    return errors.reduce<Record<string, string>>((result, item) => {
      const field = item.field ?? item.path;

      if (field && item.message) {
        result[field] = item.message;
      }

      return result;
    }, {});
  }

  return Object.entries(errors).reduce<Record<string, string>>((result, [field, value]) => {
    result[field] = Array.isArray(value) ? value.join(", ") : value;
    return result;
  }, {});
}

function toApiError(error: unknown): ApiClientError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;
    const message = getBackendMessage(data, axiosError.message || "Request failed");

    return new ApiClientError(message, status, normalizeValidationErrors(data?.errors));
  }

  if (error instanceof Error) {
    return new ApiClientError(error.message);
  }

  return new ApiClientError("Request failed");
}

function redirectToLogin() {
  if (typeof window === "undefined") return;

  const returnUrl = `${window.location.pathname}${window.location.search}`;
  window.location.assign(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
}

function normalizeLoginResponse(payload: LegacyAuthResponse | LoginResponse): LoginResponse {
  const token = "token" in payload && payload.token ? payload.token : "accessToken" in payload ? payload.accessToken : undefined;

  if (!token) {
    throw new ApiClientError("Login response did not include an access token");
  }

  return {
    token,
    refreshToken: payload.refreshToken ?? "",
    user: payload.user,
  };
}

function normalizeRefreshResponse(payload: LegacyRefreshResponse | RefreshResponse): RefreshResponse {
  const token = "token" in payload && payload.token ? payload.token : "accessToken" in payload ? payload.accessToken : undefined;

  if (!token) {
    throw new ApiClientError("Refresh response did not include an access token");
  }

  return {
    token,
    refreshToken: payload.refreshToken,
  };
}

function normalizeUserResponse(payload: UserResponse): User {
  return isRecord(payload) && "user" in payload ? (payload.user as User) : payload;
}

class ApiClient {
  private readonly client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: string) => void;
    reject: (reason: unknown) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      withCredentials: true,
    });

    this.client.interceptors.request.use((config) => {
      const token = getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RetryRequestConfig | undefined;

        if (
          error.response?.status !== 401 ||
          !originalRequest ||
          originalRequest._retry ||
          originalRequest._skipAuthRefresh
        ) {
          return Promise.reject(error);
        }

        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${token}`,
              };
              return this.client(originalRequest);
            })
            .catch((queueError: unknown) => Promise.reject(queueError));
        }

        originalRequest._retry = true;
        this.isRefreshing = true;

        try {
          const refreshResponse = await this.refreshAccessToken();
          this.failedQueue.forEach(({ resolve }) => resolve(refreshResponse.token));
          this.failedQueue = [];

          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${refreshResponse.token}`,
          };

          return this.client(originalRequest);
        } catch (refreshError) {
          this.failedQueue.forEach(({ reject }) => reject(refreshError));
          this.failedQueue = [];
          clearTokens();
          redirectToLogin();
          return Promise.reject(refreshError);
        } finally {
          this.isRefreshing = false;
        }
      },
    );
  }

  private async refreshAccessToken(): Promise<RefreshResponse> {
    const response = await this.client.post<unknown>(
      "/auth/refresh-token",
      { refreshToken: getRefreshToken() },
      { _skipAuthRefresh: true } as RetryRequestConfig,
    );
    const payload = normalizeRefreshResponse(unwrapApiData<LegacyRefreshResponse | RefreshResponse>(response.data));

    if (payload.refreshToken) {
      saveTokens(payload.token, payload.refreshToken);
    } else {
      saveToken(payload.token);
    }

    return payload;
  }

  private async request<T>(config: RetryRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<unknown>(config);
      return unwrapApiData<T>(response.data);
    } catch (error) {
      throw toApiError(error);
    }
  }

  public setAccessToken(token: string): void {
    saveToken(token);
  }

  public getAccessToken(): string | null {
    return getToken();
  }

  public clearAuth(): void {
    clearTokens();
  }

  public get<T>(url: string, params?: QueryParams): Promise<T> {
    return this.request<T>({ method: "GET", url, params });
  }

  public post<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>({ method: "POST", url, data });
  }

  public patch<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>({ method: "PATCH", url, data });
  }

  public put<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>({ method: "PUT", url, data });
  }

  public delete<T>(url: string): Promise<T> {
    return this.request<T>({ method: "DELETE", url });
  }

  public postFormData<T>(url: string, formData: FormData): Promise<T> {
    return this.request<T>({
      method: "POST",
      url,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  public getExternalJson<T>(url: string): Promise<T> {
    return this.request<T>({
      method: "GET",
      url,
      baseURL: undefined,
      _skipAuthRefresh: true,
    });
  }
}

export const apiClient = new ApiClient();

export function get<T>(url: string, params?: QueryParams): Promise<T> {
  return apiClient.get<T>(url, params);
}

export function post<T>(url: string, data?: unknown): Promise<T> {
  return apiClient.post<T>(url, data);
}

export function patch<T>(url: string, data?: unknown): Promise<T> {
  return apiClient.patch<T>(url, data);
}

export function postFormData<T>(url: string, formData: FormData): Promise<T> {
  return apiClient.postFormData<T>(url, formData);
}

export function getExternalJson<T>(url: string): Promise<T> {
  return apiClient.getExternalJson<T>(url);
}

export const authAPI = {
  registerCustomer: (data: CustomerRegisterPayload) => post<User>("/auth/register/customer", data),
  registerServiceProvider: (data: ProviderRegisterPayload) => post<User>("/auth/register/service-provider", data),
  login: async (data: LoginPayload) => normalizeLoginResponse(await post<LegacyAuthResponse | LoginResponse>("/auth/login", data)),
  refreshToken: async () => normalizeRefreshResponse(await post<LegacyRefreshResponse | RefreshResponse>("/auth/refresh-token", {})),
  logout: () => post<ApiEnvelope<null>>("/auth/logout", {}),
  forgotPassword: (email: string) => post<ApiEnvelope<null>>("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) => post<ApiEnvelope<null>>("/auth/reset-password", { token, password }),
};

export const usersAPI = {
  getMyProfile: async () => normalizeUserResponse(await get<UserResponse>("/users/me")),
  updateMyProfile: async (data: Partial<UserProfile>) => normalizeUserResponse(await patch<UserResponse>("/users/me", data)),
  getEngineerDirectory: (params?: EngineerDirectoryParams) => get<Engineer[]>("/users/engineers", params),
  getEngineerById: (id: string) => get<Engineer>(`/users/engineers/${id}`),
  getEngineerReviews: (id: string) => get<EngineerReview[]>(`/users/engineers/${id}/reviews`),
  uploadDocument: (formData: FormData) => postFormData<User>("/users/me/documents", formData),
  getVerificationStatus: () => get<VerificationStatus>("/users/me/verification"),
};

export const jobsAPI = {
  postJob: (data: CreateJobPayload) => post<Job>("/jobs", data),
  browseJobsBoard: (params?: JobFilterParams) => get<JobsResponse>("/jobs", params),
  searchJobsNearMe: (lat: number, lng: number, radius?: number) =>
    get<Job[]>("/jobs", { lat, lng, radius: radius ?? 25 }),
  getJobById: (id: string) => get<Job>(`/jobs/${id}`),
  applyToJob: (jobId: string, data: ApplicationPayload) => post<Application>(`/jobs/${jobId}/apply`, data),
  getMyJobs: () => get<Job[]>("/jobs/my"),
  updateJobStatus: (jobId: string, status: string) => patch<Job>(`/jobs/${jobId}/status`, { status }),
  getJobApplications: (jobId: string) => get<Application[]>(`/jobs/${jobId}/applications`),
  getMyApplications: () => get<Application[]>("/jobs/my-applications"),
  acceptApplication: (jobId: string, applicationId: string) =>
    patch<Application>(`/jobs/${jobId}/applications/${applicationId}/accept`, {}),
};

export const invoicesAPI = {
  createInvoice: (data: CreateInvoicePayload) => post<Invoice>("/invoices", data),
  getMyInvoices: () => get<Invoice[]>("/invoices"),
  getInvoiceById: (id: string) => get<Invoice>(`/invoices/${id}`),
  updateInvoiceStatus: (id: string, status: string) => patch<Invoice>(`/invoices/${id}/status`, { status }),
  requestPayout: () => post<ApiEnvelope<null>>("/invoices/request-payout", {}),
};

export const amcAPI = {
  getMyContracts: () => get<AMCContract[]>("/amc"),
  createContract: (data: CreateAMCPayload) => post<AMCContract>("/amc", data),
};

export const adminAPI = {
  getAllUsers: (params?: AdminUserParams) => get<User[]>("/admin/users", params),
  getPendingVerifications: () => get<User[]>("/admin/verifications/pending"),
  approveVerification: (userId: string) => patch<User>(`/admin/users/${userId}/verify`, { status: "approved" }),
  rejectVerification: (userId: string, reason: string) =>
    patch<User>(`/admin/users/${userId}/verify`, { status: "rejected", reason }),
  getAllJobs: (params?: AdminJobParams) => get<Job[]>("/admin/jobs", params),
  getDashboardStats: () => get<AdminStats>("/admin/dashboard/stats"),
  updateEngineerTier: (userId: string, tier: EngineerTier) => patch<User>(`/admin/users/${userId}/tier`, { tier }),
  suspendUser: (userId: string) => patch<User>(`/admin/users/${userId}/suspend`, {}),
};

export const notificationsAPI = {
  getNotifications: () => get<AppNotification[]>("/notifications"),
};
