// Shared TypeScript types matching backend schemas

export type ELVCategory =
  | "cctv"
  | "access_control"
  | "fire_alarm"
  | "structured_cabling"
  | "pa_system"
  | "bms"
  | "intercom"
  | "gate_automation"
  | "av_integration"
  | "other";

export type UserRole = "customer" | "service_provider" | "admin";

export type JobStatus =
  | "draft"
  | "open"
  | "applications_received"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "shortlisted";

export type InvoiceType =
  | "tax_invoice"
  | "proforma"
  | "boq"
  | "amc"
  | "progress"
  | "credit_note";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "disputed"
  | "cancelled";

export type InvoiceTemplate = "classic" | "modern" | "detailed";

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  profile: {
    fullName: string;
    companyName?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
  };
  businessDetails?: {
    trn?: string;
    licenseNumber?: string;
    bankName?: string;
    bankAccountNumber?: string;
    iban?: string;
    swiftCode?: string;
  };
  serviceProvider?: {
    specializations: ELVCategory[];
    yearsOfExperience?: number;
    certifications?: string[];
    serviceArea?: {
      city?: string;
      country?: string;
    };
    location?: {
      type: "Point";
      coordinates: [number, number]; // [longitude, latitude]
    };
    serviceRadius?: number;
    isVerified?: boolean;
    averageRating?: number;
    totalReviews?: number;
    totalJobsCompleted?: number;
  };
  subscription?: {
    plan: "free" | "pro" | "business";
    status: "active" | "inactive" | "cancelled";
    expiresAt?: string;
    invoicesThisMonth?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken?: string;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CustomerRegisterPayload {
  email: string;
  password: string;
  fullName: string;
  companyName?: string;
  phone: string;
  industry: "real_estate" | "hospitality" | "healthcare" | "retail" | "other";
  city: string;
  country: string;
}

export interface ServiceProviderRegisterPayload {
  email: string;
  password: string;
  fullName: string;
  companyName?: string;
  phone: string;
  specializations: ELVCategory[];
  yearsOfExperience?: number;
  licenseNumber?: string;
  city: string;
  country: string;
  serviceRadius?: number;
}

export type RegisterPayload = CustomerRegisterPayload | ServiceProviderRegisterPayload;

export interface Job {
  _id: string;
  customerId: string;
  title: string;
  description: string;
  category: ELVCategory[];
  status: JobStatus;
  visibility: "public" | "invite_only";
  budget: {
    type: "fixed" | "range" | "get_quotes";
    min?: number;
    max?: number;
    currency?: string;
  };
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: [number, number];
  };
  timeline: {
    startDate: string;
    deadline: string;
  };
  attachments?: Array<{
    url: string;
    filename: string;
    type: string;
  }>;
  applications?: JobApplication[];
  assignedTo?: string;
  invoiceId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobApplication {
  _id?: string;
  serviceProviderId: string;
  appliedAt?: string;
  coverNote: string;
  proposedAmount?: number;
  status: ApplicationStatus;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  userId: string;
  type: InvoiceType;
  status: InvoiceStatus;
  template: InvoiceTemplate;
  from: {
    name: string;
    companyName?: string;
    email: string;
    phone?: string;
    address?: string;
    trn?: string;
    logo?: string;
    bankName?: string;
    accountNumber?: string;
    iban?: string;
  };
  to: {
    customerId?: string;
    name: string;
    companyName?: string;
    email: string;
    phone?: string;
    address?: string;
    trn?: string;
  };
  projectName?: string;
  siteAddress?: string;
  poNumber?: string;
  contractRef?: string;
  jobId?: string;
  invoiceDate: string;
  dueDate: string;
  sentAt?: string;
  viewedAt?: string;
  lineItems: InvoiceLineItem[];
  currency: string;
  subtotal: number;
  globalDiscount?: number;
  taxableAmount: number;
  vatAmount: number;
  retentionPercentage?: number;
  grandTotal: number;
  payments?: InvoicePayment[];
  totalPaid?: number;
  balanceDue?: number;
  paymentTerms?: string;
  notes?: string;
  termsAndConditions?: string;
  warrantyTerms?: string;
  portalToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceLineItem {
  _id?: string;
  category: ELVCategory | "labor" | "service" | "amc" | "variation" | "other";
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  vatRate?: number;
  lineTotal: number;
  vatAmount?: number;
  lineTotalWithVat?: number;
}

export interface InvoicePayment {
  _id?: string;
  date: string;
  amount: number;
  method: "bank_transfer" | "cash" | "cheque" | "card";
  reference?: string;
  notes?: string;
}

export type Client = User & {
  role: "customer";
};

export type Engineer = User & {
  role: "service_provider";
  serviceProvider: NonNullable<User["serviceProvider"]>;
};

export type Admin = User & {
  role: "admin";
};

export interface Payment {
  _id: string;
  amount: number;
  currency: string;
  status: "authorized" | "captured" | "pending" | "failed" | "refunded";
  method?: "upi" | "card" | "netbanking" | "wallet" | "bank_transfer" | "cash" | "cheque";
  clientId?: string;
  engineerId?: string;
  jobId?: string;
  invoiceId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Vendor {
  _id: string;
  userId: string;
  name: string;
  city?: string;
  tier?: "bronze" | "silver" | "gold" | "platinum";
  categories: ELVCategory[];
  completionRate?: number;
  rating?: number;
  jobsDone?: number;
  complaints?: number;
  score?: number;
  status?: "active" | "paused" | "under_review";
}

export interface ApiError {
  status: string;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  status: string;
  message: string;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
