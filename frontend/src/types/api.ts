export type UserRole = "customer" | "service_provider" | "admin";
export type EngineerTier = "silver" | "gold" | "platinum" | "specialist";
export type VerificationDecision = "pending" | "verified" | "rejected";
export type JobCategory = "cctv" | "fire_safety" | "access_control" | "data_networking";
export type JobStatus = "open" | "assigned" | "in_progress" | "completed" | "cancelled";
export type JobUrgency = "normal" | "urgent" | "emergency";
export type ComplianceLevel = "standard" | "high" | "critical";
export type ApplicationStatus = "pending" | "accepted" | "rejected";
export type InvoiceStatus = "pending" | "paid" | "disputed" | "refunded";
export type AMCVisitFrequency = "monthly" | "quarterly" | "biannual" | "annual";
export type AMCStatus = "active" | "expiring_soon" | "expired" | "cancelled";
export type ServiceRadiusOption = 10 | 25 | 50 | 100;
export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;
export type NotificationType =
  | "new_application"
  | "job_assigned"
  | "invoice_created"
  | "verification_approved"
  | "verification_rejected";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  avatarUrl?: string;
  bio?: string;
  serviceProvider?: Partial<Engineer["serviceProvider"]>;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    _id: string;
    email: string;
    role: UserRole;
    profile: UserProfile;
  };
}

export interface RefreshResponse {
  token: string;
  refreshToken?: string;
}

export interface CustomerRegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
}

export interface ProviderRegisterPayload extends CustomerRegisterPayload {
  businessName: string;
  gstNumber?: string;
  yearsOfExperience: number;
  categories: JobCategory[];
  serviceRadius: ServiceRadiusOption;
}

export interface Engineer {
  _id: string;
  email: string;
  role: "service_provider";
  profile: UserProfile;
  serviceProvider: {
    categories: string[];
    tier: EngineerTier;
    rating: number;
    completionRate: number;
    totalJobs: number;
    verificationStatus: VerificationDecision;
    serviceRadius: number;
    certifications: string[];
    gstNumber?: string;
    yearsOfExperience?: number;
    businessName?: string;
    panNumber?: string;
    companyWebsite?: string;
    complaints?: number;
  };
}

export interface UserDocument {
  _id: string;
  documentType: string;
  fileName?: string;
  url?: string;
  signedUrl?: string;
  mimeType?: string;
  createdAt?: string;
}

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
  serviceProvider?: Engineer["serviceProvider"];
  documents?: UserDocument[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EngineerDirectoryParams extends QueryParams {
  city?: string;
  category?: JobCategory;
  tier?: EngineerTier;
  minRating?: number;
  verificationStatus?: VerificationDecision;
  page?: number;
  limit?: number;
}

export interface VerificationStatus {
  status: VerificationDecision;
  documentsSubmitted: number;
  documentsRequired: number;
  pendingDocuments?: string[];
  rejectedReason?: string;
  updatedAt?: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  category: JobCategory;
  status: JobStatus;
  urgency: JobUrgency;
  complianceLevel: ComplianceLevel;
  budgetMin: number;
  budgetMax: number;
  city: string;
  area: string;
  siteType: string;
  clientId: string;
  assignedEngineerId?: string;
  applicantCount: number;
  createdAt: string;
  floors?: string;
  startDate?: string;
  expectedDuration?: string;
  paymentPreference?: string;
  assignedEngineer?: Engineer;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface CreateJobPayload {
  title: string;
  description: string;
  category: JobCategory;
  urgency: JobUrgency;
  complianceLevel: ComplianceLevel;
  budgetMin: number;
  budgetMax: number;
  city: string;
  area: string;
  siteType: string;
  floors?: string;
  startDate?: string;
  expectedDuration?: string;
  paymentPreference?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface JobFilterParams extends QueryParams {
  city?: string;
  area?: string;
  category?: JobCategory;
  urgency?: JobUrgency;
  status?: JobStatus;
  minBudget?: number;
  maxBudget?: number;
  page?: number;
  limit?: number;
  sort?: "newest" | "budget" | "urgency" | "distance";
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
}

export interface Application {
  _id: string;
  jobId: string;
  engineerId: string;
  status: ApplicationStatus;
  coverNote?: string;
  proposedBudget?: number;
  createdAt: string;
  engineer?: Engineer;
}

export interface ApplicationPayload {
  coverNote?: string;
  proposedBudget?: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber?: string;
  jobId: string;
  clientId: string;
  engineerId: string;
  amount: number;
  status: InvoiceStatus;
  milestone: string;
  dueDate: string;
  createdAt: string;
  job?: Job;
  engineer?: Engineer;
}

export interface CreateInvoicePayload {
  jobId: string;
  clientId: string;
  engineerId: string;
  amount: number;
  milestone: string;
  dueDate: string;
}

export interface AdminStats {
  totalUsers: number;
  totalEngineers: number;
  totalCustomers: number;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  pendingVerifications: number;
  totalRevenue: number;
  newSignupsToday: number;
  jobsPostedToday: number;
}

export interface AdminUserParams extends QueryParams {
  role?: UserRole;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminJobParams extends QueryParams {
  status?: JobStatus;
  city?: string;
  category?: JobCategory;
  page?: number;
  limit?: number;
}

export interface AMCContract {
  _id: string;
  jobId: string;
  clientId: string;
  engineerId: string;
  startDate: string;
  endDate: string;
  annualAmount: number;
  visitFrequency: AMCVisitFrequency;
  status: AMCStatus;
  nextVisitDate: string;
  job?: Job;
  engineer?: Engineer;
}

export interface CreateAMCPayload {
  jobId: string;
  clientId: string;
  engineerId: string;
  startDate: string;
  endDate: string;
  annualAmount: number;
  visitFrequency: AMCVisitFrequency;
  nextVisitDate: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string;
  unread: boolean;
  href?: string;
  reason?: string;
}

export interface EngineerReview {
  _id: string;
  engineerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  avatarUrl?: string;
}
