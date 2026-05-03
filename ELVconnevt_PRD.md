# ELV CONNECT — Product Requirements Document (PRD)

> **Product:** ELV CONNECT — Invoice Generator SaaS  
> **Industry:** Integrated Security & ELV (Extra Low Voltage) Solutions  
> **Version:** 1.0  
> **Color Theme:** Purple tone (`#7C3AED` primary, `#5B21B6` dark, `#EDE9FE` light)  
> **Prepared for:** Development Team / AI Coding Assistants

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [User Roles & Personas](#3-user-roles--personas)
4. [Tech Stack](#4-tech-stack)
5. [Site Map & Page Structure](#5-site-map--page-structure)
6. [Feature Specifications](#6-feature-specifications)
7. [Invoice Generator — Core Module](#7-invoice-generator--core-module)
8. [Database Schema](#8-database-schema)
9. [API Documentation Standard](#9-api-documentation-standard)
10. [Backend Architecture](#10-backend-architecture)
11. [Frontend Architecture](#11-frontend-architecture)
12. [Security Checklist](#12-security-checklist)
13. [Environment Variables](#13-environment-variables)
14. [Repository Structure](#14-repository-structure)
15. [Master Build Prompt](#15-master-build-prompt)

---

## 1. Executive Summary

**ELV CONNECT** is a B2B SaaS platform purpose-built for the **Integrated Security & ELV (Extra Low Voltage) Solutions** industry. It serves as a marketplace and operational hub connecting **Customers** (companies and property owners requiring ELV installations) with **Service Providers** (licensed ELV engineers, vendors, and contractors).

The platform's flagship feature is a **domain-specific Invoice Generator** that understands ELV project structures — BOQ (Bill of Quantities), material line items, labor charges, AMC (Annual Maintenance Contract) renewals, VAT/tax handling, and multi-phase project billing.

### What is ELV?

ELV (Extra Low Voltage) solutions include:
- CCTV & Video Surveillance Systems
- Access Control & Biometric Systems
- Fire Alarm & Detection Systems
- PA (Public Address) & Background Music Systems
- Structured Cabling & Data Networks
- Building Management Systems (BMS)
- Intercom & Video Door Phone Systems
- Boom Barriers & Parking Management
- Gate Automation Systems
- SMATV & AV Integration

---

## 2. Product Vision & Goals

### Vision
To be the single operational platform for the ELV solutions ecosystem — where customers find certified engineers, projects are tracked end-to-end, and professional invoices are generated in seconds.

### Primary Goals
- Reduce invoice creation time from hours to minutes for ELV contractors
- Provide a verified marketplace of ELV engineers and vendors
- Enable location-based job matching between customers and engineers
- Automate AMC renewal billing and follow-up
- Create a professional digital presence for small ELV firms

### Success Metrics
- Invoice generation < 2 minutes per document
- 80% of users create their first invoice within 10 minutes of signup
- Job-to-engineer match rate > 70% within 24 hours
- Monthly Recurring Revenue from premium subscriptions

---

## 3. User Roles & Personas

### 3.1 Customer
A company or individual who needs ELV services installed, maintained, or repaired.

**Attributes:**
- Can post jobs (service requests)
- Can browse and contact engineers/vendors
- Can receive and pay invoices
- Can view project history and documents
- Can rate and review service providers

**Examples:** Real estate developers, facility managers, hospital IT departments, retail chain owners

### 3.2 Service Provider (Engineer / Vendor)
A certified ELV engineer, subcontractor, or solution company offering services.

**Attributes:**
- Can list their skills, certifications, and service areas
- Can apply to posted jobs
- Can create and send invoices to customers
- Can manage multiple active projects
- Can issue AMC contracts and renewal invoices
- Can create BOQ documents

**Examples:** CCTV installation companies, freelance access control engineers, fire alarm system integrators

### 3.3 Admin
Platform operator with full access.

**Attributes:**
- Can verify and approve engineer/vendor listings
- Can moderate job postings
- Can manage subscriptions and billing
- Can view platform analytics
- Can handle disputes

---

## 4. Tech Stack

> **⚠️ Version Safety Rule:** Never hardcode version numbers. Web search each dependency for the latest stable release before writing `package.json`.

| Layer | Technology | Notes |
|---|---|---|
| **Frontend Framework** | Next.js (App Router) | SSR + SSG for SEO on public pages |
| **UI Library** | React | Component-based architecture |
| **Styling** | TailwindCSS | Purple design system tokens |
| **Backend** | Node.js + Express | REST API |
| **Authentication** | Email/Password only | JWT access + refresh token pattern |
| **Database** | MongoDB Atlas | Cloud-hosted |
| **ODM** | Mongoose | Schema validation |
| **Validation** | Zod | Runtime type safety |
| **Password Hashing** | bcryptjs | Cost factor ≥ 10 |
| **Security Headers** | helmet | CSP tuned for Next.js |
| **CORS** | cors | Explicit origin list |
| **Rate Limiting** | express-rate-limit | Per-route |
| **NoSQL Sanitize** | express-mongo-sanitize | Injection prevention |
| **PDF Generation** | @react-pdf/renderer | Invoice PDF export |
| **Email** | nodemailer | Invoice delivery, notifications |
| **File Upload** | multer + Cloudinary | Company logos, engineer photos |
| **Maps** | react-leaflet or Google Maps JS API | Location-based job matching |
| **Logging** | winston | Structured production logs |
| **Monitoring** | @sentry/node | Error tracking |
| **Job Scheduling** | node-cron | AMC renewal reminders |
| **Deployment Frontend** | Vercel | Next.js optimized |
| **Deployment Backend** | Render / Railway | Node.js API |
| **Deployment DB** | MongoDB Atlas | IP allowlist |

### Design System — Purple Theme

```css
/* Tailwind Config Extensions */
colors: {
  brand: {
    50:  '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',   /* Primary */
    800: '#5b21b6',   /* Dark */
    900: '#4c1d95',   /* Darkest */
  }
}
```

---

## 5. Site Map & Page Structure

Based on the page architecture diagram provided, ELV CONNECT has the following page structure:

```
ELV CONNECT (Root)
│
├── HOME (/)
│   ├── CUSTOMER Section
│   │   ├── Our Customers (/customers)          — showcase of registered customers
│   │   ├── Job Fill (/jobs/post)               — customer posts a new job
│   │   └── Find Our Engineers (/engineers)     — browse verified ELV engineers
│   │
│   ├── SERVICE Section
│   │   ├── Find Your Job (/jobs)               — engineers browse open jobs
│   │   └── See the Vendors (/vendors)          — browse ELV vendors/companies
│   │
│   └── YOUR LOCATION (/location)
│       └── Your Nearby Jobs (/jobs/nearby)     — location-filtered job board
│
├── ABOUT (/about)
├── CONTACT US (/contact)
├── PRIVACY POLICY (/privacy)
│
├── PRICING (/pricing)
│   ├── FREE tier details
│   └── PRICING TABLE — comparison of all plans
│
├── OUR CLIENTS (/clients)                      — customer logos & testimonials
└── LATEST JOIN ENGINEERS (/engineers/latest)   — recently verified engineers
```

### Dashboard (Authenticated)

```
/dashboard
├── /dashboard/invoices          — Invoice list & generator
├── /dashboard/invoices/new      — Create new invoice
├── /dashboard/invoices/:id      — View / edit invoice
├── /dashboard/jobs              — Job management
├── /dashboard/jobs/:id          — Job detail
├── /dashboard/profile           — User profile (customer or service provider)
├── /dashboard/engineers         — (Customer) Browse & shortlist engineers
├── /dashboard/customers         — (Service Provider) My customers
├── /dashboard/contracts         — AMC contracts
├── /dashboard/reports           — Financial reports
└── /dashboard/settings          — Account settings
```

---

## 6. Feature Specifications

### 6.1 Authentication — Login & Signup

**Based on Feature Map:** The "WHO YOU ARE" button on the signup/login screen routes users into either the Customer or Service Provider flow.

#### Sign Up Flow

```
Landing Page
    ↓
"Get Started" CTA
    ↓
WHO YOU ARE? (Role Selection Screen)
    ├── [CUSTOMER]                ← Yellow button (from design)
    │       ↓
    │   Customer Registration Form
    │   - Full Name
    │   - Company Name
    │   - Business Email
    │   - Phone Number
    │   - Password
    │   - Industry Segment (dropdown: Real Estate / Hospitality / Healthcare / Retail / Other)
    │   - City / Emirate
    │
    └── [SERVICE PROVIDER]        ← Yellow button (from design)
            ↓
        Service Provider Registration Form
        - Full Name / Company Name
        - Business Email
        - Phone Number
        - Password
        - ELV Specialization (multi-select checkboxes):
          ☐ CCTV & Surveillance
          ☐ Access Control
          ☐ Fire Alarm
          ☐ Structured Cabling
          ☐ PA Systems
          ☐ BMS
          ☐ Intercom
          ☐ Gate Automation
          ☐ AV Integration
        - Years of Experience
        - License / Certification Number
        - Service Area (City / Region)
```

#### Login Flow

```
/auth/login
- Email
- Password
- "Forgot Password?" link → /auth/forgot-password
- "Don't have an account?" → /auth/register
```

#### Password Reset

```
POST /auth/forgot-password  → sends reset link to email (valid 1 hour)
POST /auth/reset-password   → accepts token + new password
```

---

### 6.2 Dashboard

Role-aware dashboard that shows different widgets based on user type.

#### Customer Dashboard Widgets

| Widget | Description |
|---|---|
| Active Jobs | Count of open/in-progress jobs |
| Total Spent | Sum of all paid invoices (current month / all time) |
| Pending Invoices | Invoices awaiting payment |
| Recent Engineers | Engineers who worked with you recently |
| Upcoming AMC Renewals | AMC contracts expiring in next 30 days |
| Quick Actions | Post a Job, Pay Invoice, Download Receipt |

#### Service Provider Dashboard Widgets

| Widget | Description |
|---|---|
| Open Jobs Nearby | Location-matched available jobs |
| Revenue This Month | Sum of paid invoices |
| Draft Invoices | Unsent invoices |
| Active Contracts | Ongoing projects / AMC contracts |
| Pending Payments | Invoices sent but not yet paid |
| Quick Actions | Create Invoice, Post Availability, View Jobs |

---

### 6.3 Location Feature

**Purpose:** Match engineers to jobs based on proximity.

#### How It Works

1. On registration, users provide their city/emirate
2. Service providers can also set a **service radius** (e.g., 20 km)
3. When a customer posts a job, they enter the job location
4. The platform surfaces engineers within the service radius
5. "Your Nearby Jobs" page (for engineers) shows jobs filtered to their service area

#### Implementation

```
GET /api/v1/jobs?lat=25.2048&lng=55.2708&radius=25  → returns jobs within 25km
GET /api/v1/engineers?lat=25.2048&lng=55.2708&radius=25  → returns engineers in area
```

MongoDB geospatial index on `location.coordinates` (GeoJSON Point format)

---

### 6.4 Job Board

#### Posting a Job (Customer)

Fields:
- Job Title (e.g., "CCTV Installation - Villa 4BR")
- ELV Category (dropdown: same as specializations above)
- Description / Scope of Work
- Site Location (address + map pin)
- Budget Range (optional, or "Get Quotes")
- Timeline / Deadline
- Attachments (floor plan, photos — PDF or image, max 10MB)
- Visibility (Public / Invite Only)

#### Browsing Jobs (Service Provider)

Filters:
- Category
- Location / Radius
- Budget Range
- Date Posted
- Status (Open / In Progress / Completed)

#### Job Status Flow

```
DRAFT → OPEN → APPLICATIONS RECEIVED → IN PROGRESS → COMPLETED → CLOSED
```

---

### 6.5 Engineer & Vendor Directory

#### Engineer Profile Card Shows:
- Name + Photo
- Company (if any)
- ELV Specializations (badge list)
- Star Rating (avg from reviews)
- Total Jobs Completed
- Location / Service Area
- "Contact" button
- "View Full Profile" button

#### Vendor Profile Shows:
- Company Name + Logo
- Services Offered
- Portfolio (past projects with photos)
- Certifications (SIRA approved, Civil Defense approved, etc.)
- Contact Details
- Quote Request button

#### "Latest Join Engineers" Page
- Paginated list of recently verified engineers
- Shown on public marketing pages to build social proof
- Filter by specialization

---

## 7. Invoice Generator — Core Module

This is the **flagship feature** of ELV CONNECT. It is purpose-built for ELV project billing.

### 7.1 Invoice Types Supported

| Type | Use Case |
|---|---|
| **Proforma Invoice** | Before work starts — cost estimate for approval |
| **Tax Invoice** | Standard invoice after work completion |
| **BOQ Invoice** | Bill of Quantities — itemized ELV material + labor |
| **AMC Invoice** | Annual Maintenance Contract billing |
| **Progress Invoice** | Milestone-based billing for large projects |
| **Credit Note** | Corrections, refunds, or adjustments |

---

### 7.2 Invoice Creation Flow

```
Dashboard → Invoices → [+ New Invoice]
                ↓
Step 1: Select Invoice Type
        (Tax Invoice / BOQ / AMC / Proforma / Progress / Credit Note)
                ↓
Step 2: Customer Details
        - Select from saved customers OR enter new
        - Bill To: Company, Address, TRN (Tax Registration Number)
                ↓
Step 3: Project Info
        - Project Name / Reference
        - Site Address
        - PO Number (customer's purchase order)
        - Contract Reference
        - Invoice Date
        - Due Date
                ↓
Step 4: Line Items (BOQ Table)
        - Add rows:
          | # | Description | Unit | Qty | Unit Price | Discount | VAT% | Total |
        - Categories: Material Supply / Labor / Services / AMC / Variation
        - ELV item library (searchable catalog of common items)
                ↓
Step 5: Summary
        - Subtotal
        - Discount (line-item or global %)
        - VAT (5% UAE standard, configurable per country)
        - Retention (configurable %, common in construction)
        - Grand Total
                ↓
Step 6: Terms & Notes
        - Payment Terms (Net 15 / Net 30 / Due on Receipt)
        - Bank Details (auto-filled from profile)
        - Notes / Remarks
        - Warranty Terms
                ↓
Step 7: Preview & Send
        - Live PDF preview
        - Save as Draft
        - Send via Email
        - Download PDF
        - Share via Link (password-protected portal link)
```

---

### 7.3 ELV Item Library (Pre-loaded Catalog)

A searchable catalog of common ELV materials to speed up invoice creation:

**CCTV Category:**
- IP Camera 2MP (Indoor Dome)
- IP Camera 4MP (Outdoor Bullet)
- NVR 8CH 4K
- Hard Disk 4TB Surveillance Grade
- Cat6 Cable (per meter)
- CCTV Installation & Configuration (per camera)

**Access Control Category:**
- Biometric Reader (Fingerprint + Card)
- Electric Magnetic Lock 600LB
- Door Controller 2-Door
- Exit Button (NO/NC)
- Access Card (per piece)
- Access Control Programming (per door)

**Fire Alarm Category:**
- Conventional Fire Panel 4 Zone
- Smoke Detector (Photoelectric)
- Manual Call Point
- Bell / Sounder
- Fire Alarm Cable 2C (per meter)
- Fire Alarm Installation (per point)

*(And so on for PA, Cabling, BMS, Intercom, Gate, AV)*

---

### 7.4 Invoice Templates

Three visual templates, all purple-themed:

1. **Classic** — Traditional layout, logo top-left, clean table
2. **Modern** — Full-bleed header bar in `brand-700`, minimalist rows
3. **Detailed** — Expanded BOQ format with section grouping and subtotals

---

### 7.5 AMC Module

For recurring maintenance contracts:

**AMC Contract Fields:**
- Customer & Site
- Systems Covered (CCTV / Access / Fire / etc.)
- Contract Start Date
- Contract Duration (1 year / 2 year / 3 year)
- Total Contract Value
- Billing Frequency (Monthly / Quarterly / Bi-Annual / Annual)
- Number of Visits per Year
- Response Time SLA (e.g., 4 hours critical, 24 hours routine)

**Auto-Billing:**
- node-cron job runs daily at 8:00 AM
- Checks for AMC invoices due in next 7 days
- Auto-generates draft invoice for review
- Sends email reminder to service provider

---

### 7.6 Invoice Status Flow

```
DRAFT → SENT → VIEWED → PARTIALLY PAID → PAID
                          ↓
                       OVERDUE (if past due date)
                          ↓
                       DISPUTED
```

---

### 7.7 Payment Tracking

*(Note: No payment gateway integration in v1 — manual tracking only)*

- Service provider marks invoice as "Partially Paid" or "Paid"
- Records payment date, amount, and payment method (Bank Transfer / Cash / Cheque)
- Auto-generates receipt PDF on full payment
- Payment history log per invoice

---

### 7.8 Invoice Reports

| Report | Description |
|---|---|
| Revenue Summary | Monthly/Quarterly/Annual revenue totals |
| Outstanding Invoices | Aged receivables (30/60/90+ days) |
| Customer Statement | All invoices for a specific customer |
| VAT Report | VAT collected per period (for tax filing) |
| Top Customers | Revenue ranked by customer |
| Project P&L | Revenue vs estimated costs per project |

---

## 8. Database Schema

### 8.1 User Collection

```typescript
interface IUser {
  _id: ObjectId;
  email: string;                      // unique, lowercase
  password: string;                   // bcrypt hashed
  role: 'customer' | 'service_provider' | 'admin';
  profile: {
    fullName: string;
    companyName?: string;
    phone: string;
    avatar?: string;                  // Cloudinary URL
    bio?: string;
  };
  businessDetails: {
    trn?: string;                     // Tax Registration Number
    licenseNumber?: string;           // For service providers
    bankName?: string;
    bankAccountNumber?: string;       // Stored encrypted (AES-256-GCM)
    bankIBAN?: string;                // Stored encrypted
    bankSwiftCode?: string;
  };
  serviceProvider?: {                 // Only for role = service_provider
    specializations: ELVCategory[];
    yearsOfExperience: number;
    certifications: string[];
    serviceArea: {
      city: string;
      country: string;
    };
    location: {
      type: 'Point';
      coordinates: [number, number];  // [lng, lat] — GeoJSON
    };
    serviceRadius: number;            // km
    isVerified: boolean;
    verifiedAt?: Date;
    averageRating: number;
    totalReviews: number;
    totalJobsCompleted: number;
  };
  customer?: {                        // Only for role = customer
    industry: string;
    totalInvoicesReceived: number;
    totalAmountPaid: number;
  };
  subscription: {
    plan: 'free' | 'pro' | 'business';
    status: 'active' | 'inactive' | 'cancelled';
    expiresAt?: Date;
    invoicesThisMonth: number;        // For free tier limits
  };
  refreshTokens: Array<{
    tokenHash: string;
    createdAt: Date;
    expiresAt: Date;
    deviceInfo?: string;
  }>;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

type ELVCategory =
  | 'cctv'
  | 'access_control'
  | 'fire_alarm'
  | 'structured_cabling'
  | 'pa_system'
  | 'bms'
  | 'intercom'
  | 'gate_automation'
  | 'av_integration'
  | 'other';
```

---

### 8.2 Invoice Collection

```typescript
interface IInvoice {
  _id: ObjectId;
  invoiceNumber: string;              // Auto-generated: ELV-2024-0001
  userId: ObjectId;                   // Service provider who created it
  type: 'tax_invoice' | 'proforma' | 'boq' | 'amc' | 'progress' | 'credit_note';
  status: 'draft' | 'sent' | 'viewed' | 'partially_paid' | 'paid' | 'overdue' | 'disputed' | 'cancelled';
  template: 'classic' | 'modern' | 'detailed';

  // Parties
  from: {
    name: string;
    companyName?: string;
    email: string;
    phone?: string;
    address: string;
    trn?: string;
    logo?: string;
    bankName?: string;
    bankAccount?: string;
    iban?: string;
  };
  to: {
    customerId?: ObjectId;            // If saved customer
    name: string;
    companyName?: string;
    email: string;
    phone?: string;
    address: string;
    trn?: string;
  };

  // Project Info
  projectName?: string;
  siteAddress?: string;
  poNumber?: string;                  // Customer's Purchase Order number
  contractRef?: string;
  jobId?: ObjectId;                   // Link to job if applicable

  // Dates
  invoiceDate: Date;
  dueDate: Date;
  sentAt?: Date;
  viewedAt?: Date;

  // Line Items
  lineItems: Array<{
    _id: ObjectId;
    category: ELVCategory | 'labor' | 'service' | 'amc' | 'variation' | 'other';
    description: string;
    unit: string;                     // 'pcs' | 'meter' | 'lot' | 'hour' | 'month'
    quantity: number;
    unitPrice: number;                // Stored in smallest unit (fils/cents)
    discount: number;                 // Percentage
    vatRate: number;                  // Default 5 for UAE
    lineTotal: number;                // After discount, before VAT
    vatAmount: number;
    lineTotalWithVat: number;
    catalogItemId?: ObjectId;         // Link to ELV catalog item
  }>;

  // Financials (all in smallest currency unit)
  currency: string;                   // 'AED' | 'USD' | 'SAR' | etc.
  subtotal: number;
  globalDiscount: number;             // Percentage
  globalDiscountAmount: number;
  taxableAmount: number;
  vatAmount: number;
  retentionPercentage: number;
  retentionAmount: number;
  grandTotal: number;

  // Payments
  payments: Array<{
    date: Date;
    amount: number;
    method: 'bank_transfer' | 'cash' | 'cheque' | 'card';
    reference?: string;
    notes?: string;
    recordedAt: Date;
  }>;
  totalPaid: number;
  balanceDue: number;

  // Terms
  paymentTerms: string;              // 'net_15' | 'net_30' | 'due_on_receipt'
  notes?: string;
  termsAndConditions?: string;
  warrantyTerms?: string;

  // AMC specific
  amcDetails?: {
    contractId?: ObjectId;
    contractPeriodStart: Date;
    contractPeriodEnd: Date;
    systemsCovered: ELVCategory[];
    visitSchedule: string;
  };

  // Portal
  portalToken?: string;              // For share-link (customer view without login)
  portalTokenExpires?: Date;

  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 8.3 Job Collection

```typescript
interface IJob {
  _id: ObjectId;
  customerId: ObjectId;
  title: string;
  description: string;
  category: ELVCategory[];
  status: 'draft' | 'open' | 'applications_received' | 'in_progress' | 'completed' | 'cancelled';
  visibility: 'public' | 'invite_only';
  budget: {
    type: 'fixed' | 'range' | 'get_quotes';
    min?: number;
    max?: number;
    currency: string;
  };
  location: {
    address: string;
    city: string;
    country: string;
    type: 'Point';
    coordinates: [number, number];
  };
  timeline: {
    startDate?: Date;
    deadline?: Date;
  };
  attachments: Array<{
    url: string;
    filename: string;
    type: string;
  }>;
  applications: Array<{
    serviceProviderId: ObjectId;
    appliedAt: Date;
    coverNote?: string;
    proposedAmount?: number;
    status: 'pending' | 'shortlisted' | 'accepted' | 'rejected';
  }>;
  assignedTo?: ObjectId;
  invoiceId?: ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 8.4 AMC Contract Collection

```typescript
interface IAmcContract {
  _id: ObjectId;
  serviceProviderId: ObjectId;
  customerId?: ObjectId;
  customerDetails: {
    name: string;
    companyName?: string;
    email: string;
    phone?: string;
    siteAddress: string;
  };
  systemsCovered: ELVCategory[];
  startDate: Date;
  endDate: Date;
  totalValue: number;
  currency: string;
  billingFrequency: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  nextBillingDate: Date;
  visitsPerYear: number;
  responseSla: {
    critical: number;               // hours
    routine: number;                // hours
  };
  status: 'active' | 'expired' | 'cancelled' | 'pending_renewal';
  autoRenew: boolean;
  invoiceIds: ObjectId[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 8.5 ELV Catalog Item Collection

```typescript
interface ICatalogItem {
  _id: ObjectId;
  category: ELVCategory;
  name: string;
  description?: string;
  defaultUnit: string;
  defaultUnitPrice?: number;
  currency?: string;
  brand?: string;
  partNumber?: string;
  isActive: boolean;
  createdBy: 'system' | ObjectId;   // system = platform defaults, ObjectId = user custom items
  userId?: ObjectId;                 // Owner if user-created
  usageCount: number;
  createdAt: Date;
}
```

---

### 8.6 Review Collection

```typescript
interface IReview {
  _id: ObjectId;
  jobId: ObjectId;
  reviewerId: ObjectId;             // Customer
  revieweeId: ObjectId;             // Service Provider
  rating: number;                   // 1-5
  comment?: string;
  categories: {
    quality: number;
    communication: number;
    timeliness: number;
    value: number;
  };
  isPublic: boolean;
  createdAt: Date;
}
```

---

## 9. API Documentation Standard

All endpoints follow this response shape:

```json
// Success
{ "success": true, "data": { ... } }

// Paginated success
{ "success": true, "data": [...], "pagination": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 } }

// Error
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human readable", "fields": {} } }
```

### Auth Endpoints

```
POST   /api/v1/auth/register          → Create account (customer or service_provider)
POST   /api/v1/auth/login             → Returns access token + sets refresh cookie
POST   /api/v1/auth/refresh           → Refresh access token using HttpOnly cookie
POST   /api/v1/auth/logout            → Clears refresh cookie + revokes token in DB
POST   /api/v1/auth/forgot-password   → Sends reset link to email
POST   /api/v1/auth/reset-password    → Accepts token + new password
GET    /api/v1/auth/me                → Returns current user profile
```

### Invoice Endpoints

```
GET    /api/v1/invoices               → List invoices (with filters: status, type, date range)
POST   /api/v1/invoices               → Create new invoice
GET    /api/v1/invoices/:id           → Get invoice detail
PATCH  /api/v1/invoices/:id           → Update draft invoice
DELETE /api/v1/invoices/:id           → Soft delete invoice
POST   /api/v1/invoices/:id/send      → Send invoice via email to customer
GET    /api/v1/invoices/:id/pdf       → Generate and return PDF
POST   /api/v1/invoices/:id/payments  → Record a payment
GET    /api/v1/invoices/:id/portal    → Public portal view (token-based, no auth)
POST   /api/v1/invoices/:id/portal-link → Generate share link with token
POST   /api/v1/invoices/:id/duplicate  → Duplicate invoice as new draft
```

### Job Endpoints

```
GET    /api/v1/jobs                   → List jobs (filters: category, location, status, budget)
POST   /api/v1/jobs                   → Create job (customer only)
GET    /api/v1/jobs/:id               → Get job detail
PATCH  /api/v1/jobs/:id               → Update job (owner only)
DELETE /api/v1/jobs/:id               → Soft delete
POST   /api/v1/jobs/:id/apply         → Apply to job (service provider only)
PATCH  /api/v1/jobs/:id/applications/:appId → Accept/reject application (customer only)
GET    /api/v1/jobs/nearby            → Location-filtered jobs for engineers
```

### Engineer / Vendor Endpoints

```
GET    /api/v1/engineers              → Browse verified engineers (public)
GET    /api/v1/engineers/:id          → Engineer public profile
GET    /api/v1/engineers/latest       → Most recently verified (public)
GET    /api/v1/vendors                → Browse vendor companies
PATCH  /api/v1/users/me/service-profile → Update service provider profile
```

### Catalog Endpoints

```
GET    /api/v1/catalog                → Search ELV catalog items
POST   /api/v1/catalog                → Add custom item
PATCH  /api/v1/catalog/:id            → Update custom item
DELETE /api/v1/catalog/:id            → Remove custom item
```

### AMC Endpoints

```
GET    /api/v1/amc                    → List AMC contracts
POST   /api/v1/amc                    → Create AMC contract
GET    /api/v1/amc/:id                → AMC detail
PATCH  /api/v1/amc/:id                → Update contract
POST   /api/v1/amc/:id/generate-invoice → Manually trigger invoice generation
```

### Reports Endpoints

```
GET    /api/v1/reports/revenue        → Revenue summary (period, breakdown)
GET    /api/v1/reports/outstanding    → Aged receivables
GET    /api/v1/reports/vat            → VAT report for period
GET    /api/v1/reports/customers/:id/statement → Customer statement
```

### Error Codes Master Reference

| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Zod validation failed |
| 400 | `INVALID_REQUEST` | Business rule violation |
| 401 | `UNAUTHORIZED` | No token |
| 401 | `TOKEN_EXPIRED` | Expired access token |
| 401 | `REFRESH_TOKEN_INVALID` | Bad/rotated refresh token |
| 403 | `FORBIDDEN` | Wrong role |
| 403 | `INVOICE_LIMIT_REACHED` | Free tier limit hit |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Duplicate email or invoice number |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unhandled server error |

---

## 10. Backend Architecture

### Middleware Stack Order (app.ts)

```typescript
// 1. Sentry request handler
app.use(Sentry.Handlers.requestHandler());

// 2. Security headers
app.use(helmet());

// 3. CORS
app.use(cors({ origin: env.CORS_ORIGINS.split(','), credentials: true }));

// 4. Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// 5. NoSQL injection prevention
app.use(mongoSanitize());

// 6. Logging (dev only)
if (env.NODE_ENV === 'development') app.use(morgan('dev'));

// 7. Global rate limit
app.use('/api', rateLimit({ windowMs: 60_000, max: 100 }));

// 8. Auth rate limit
app.use('/api/v1/auth', rateLimit({ windowMs: 60_000, max: 10, skipSuccessfulRequests: true }));

// 9. Health (before auth, no rate limit)
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/ready', async (req, res) => {
  const dbOk = mongoose.connection.readyState === 1;
  res.status(dbOk ? 200 : 503).json({ status: dbOk ? 'ready' : 'not_ready' });
});

// 10. Routes
app.use('/api/v1', router);

// 11. Sentry error handler
app.use(Sentry.Handlers.errorHandler());

// 12. Central error handler (always last)
app.use(errorHandler);
```

### Module Folder Structure (Backend)

```
backend/src/modules/
├── auth/
│   ├── auth.routes.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.schema.ts
├── users/
│   ├── user.routes.ts
│   ├── user.controller.ts
│   ├── user.service.ts
│   ├── user.model.ts
│   └── user.schema.ts
├── invoices/
│   ├── invoice.routes.ts
│   ├── invoice.controller.ts
│   ├── invoice.service.ts
│   ├── invoice.model.ts
│   ├── invoice.schema.ts
│   └── invoice-pdf.service.ts      ← @react-pdf/renderer logic
├── jobs/
├── engineers/
├── amc/
├── catalog/
└── reports/
```

### Freemium Tier Enforcement

```typescript
// Middleware: checkInvoiceLimit.ts
export async function checkInvoiceLimit(req, res, next) {
  const user = await User.findById(req.user._id);
  if (user.subscription.plan === 'free' && user.subscription.invoicesThisMonth >= 5) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INVOICE_LIMIT_REACHED',
        message: 'Free plan allows 5 invoices per month. Upgrade to Pro for unlimited invoices.'
      }
    });
  }
  next();
}
```

### node-cron Jobs

```typescript
// AMC invoice auto-generation — daily 8:00 AM
cron.schedule('0 8 * * *', async () => {
  const dueSoon = await AmcContract.find({
    status: 'active',
    nextBillingDate: { $lte: addDays(new Date(), 7) }
  });
  for (const contract of dueSoon) {
    await generateAmcDraftInvoice(contract);
    await sendAmcReminderEmail(contract);
  }
});

// Mark invoices overdue — daily 1:00 AM
cron.schedule('0 1 * * *', async () => {
  await Invoice.updateMany(
    { status: 'sent', dueDate: { $lt: new Date() } },
    { $set: { status: 'overdue' } }
  );
});

// Reset monthly invoice counter — 1st of each month at midnight
cron.schedule('0 0 1 * *', async () => {
  await User.updateMany({}, { $set: { 'subscription.invoicesThisMonth': 0 } });
});
```

---

## 11. Frontend Architecture

### Next.js App Router Structure

```
frontend/
├── app/
│   ├── layout.tsx                    ← Root layout (fonts, providers, theme)
│   ├── page.tsx                      ← Home (/)
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── privacy/page.tsx
│   ├── pricing/page.tsx
│   ├── clients/page.tsx
│   ├── engineers/
│   │   ├── page.tsx                  ← Browse engineers
│   │   ├── latest/page.tsx           ← Latest joined
│   │   └── [id]/page.tsx             ← Engineer profile
│   ├── vendors/page.tsx
│   ├── jobs/
│   │   ├── page.tsx                  ← Job board
│   │   ├── nearby/page.tsx
│   │   └── [id]/page.tsx
│   ├── location/page.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx         ← Role selection → form
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx                ← Dashboard shell (sidebar + topbar)
│   │   ├── page.tsx                  ← Role-aware dashboard
│   │   ├── invoices/
│   │   │   ├── page.tsx              ← Invoice list
│   │   │   ├── new/page.tsx          ← Invoice wizard
│   │   │   └── [id]/page.tsx         ← Invoice detail / edit
│   │   ├── jobs/
│   │   ├── contracts/
│   │   ├── customers/
│   │   ├── reports/
│   │   ├── profile/
│   │   └── settings/
│   └── invoice/[token]/page.tsx      ← Public portal (no auth required)
├── components/
│   ├── ui/                           ← Reusable primitives (Button, Card, Badge, Modal)
│   ├── layout/                       ← Header, Footer, Sidebar, MobileNav
│   ├── invoice/
│   │   ├── InvoiceWizard.tsx
│   │   ├── LineItemTable.tsx
│   │   ├── InvoiceSummary.tsx
│   │   ├── InvoicePreview.tsx
│   │   ├── InvoiceTemplateClassic.tsx
│   │   ├── InvoiceTemplateModern.tsx
│   │   └── InvoiceTemplateDetailed.tsx
│   ├── jobs/
│   ├── engineers/
│   └── auth/
│       └── RoleSelector.tsx          ← "Who are you?" screen
├── lib/
│   ├── api/
│   │   ├── client.ts                 ← Axios instance + refresh interceptor
│   │   └── refreshClient.ts
│   ├── auth/
│   │   ├── AuthProvider.tsx
│   │   └── tokenStore.ts             ← In-memory access token
│   └── env.ts                        ← Zod env validation
└── features/
    ├── invoices/
    │   ├── api.ts                    ← TanStack Query hooks
    │   └── types.ts
    ├── jobs/
    ├── engineers/
    └── reports/
```

### TailwindCSS Config (Purple Theme)

```javascript
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.tsx', './components/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',   // Primary action buttons
          800: '#5b21b6',   // Hover states, headers
          900: '#4c1d95',   // Dark backgrounds
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  }
}
```

---

## 12. Security Checklist

### Authentication & Authorization
- [ ] Email/password only — no OAuth in v1
- [ ] bcryptjs with cost factor ≥ 10 for password hashing
- [ ] JWT access token: 15 minutes, sent in `Authorization: Bearer` header
- [ ] Refresh token: 7 days, stored in `HttpOnly; Secure; SameSite=Strict` cookie
- [ ] Refresh tokens hashed before storing in DB
- [ ] Refresh token rotation on every `/auth/refresh` call
- [ ] Reused refresh token triggers full revocation
- [ ] Account lockout after 5 failed attempts — 15-minute TTL lock
- [ ] Password reset tokens expire after 1 hour
- [ ] Generic error messages — no user enumeration on forgot-password

### API Security
- [ ] helmet() enabled
- [ ] CORS with explicit origin list, never `*` with credentials
- [ ] express-mongo-sanitize in middleware chain
- [ ] Rate limiting: 100/min global, 10/min auth
- [ ] express.json({ limit: '10kb' })
- [ ] Zod validation on every route body/query/params
- [ ] assertOwnership() in every invoice/job/contract controller
- [ ] `crypto.timingSafeEqual()` for token comparisons
- [ ] Invoice portal tokens are random 32-byte hex strings, not sequential IDs
- [ ] Role check on every authenticated route (customer vs service_provider)

### Freemium Enforcement
- [ ] Free plan: max 5 invoices per month
- [ ] Counter resets on 1st of month via cron
- [ ] Cannot bypass limit by direct API call — middleware enforced

### Data Security
- [ ] Bank account numbers and IBAN stored encrypted (AES-256-GCM)
- [ ] No sensitive data in logs (no passwords, tokens, bank details, TRN)
- [ ] Sentry configured with `beforeSend` scrubbing of sensitive fields
- [ ] File uploads validated: type (PDF/JPG/PNG) + size (max 10MB)
- [ ] Cloudinary unsigned uploads not allowed — backend-signed only

### Frontend Security
- [ ] Access token in memory only — never localStorage
- [ ] Single-flight refresh queue
- [ ] DOMPurify on any user-generated content
- [ ] URL validation before use in href/src
- [ ] No API keys in frontend source (all `NEXT_PUBLIC_*` vars are non-sensitive)

---

## 13. Environment Variables

### Backend `.env.example`

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/elv_connect
# Production: mongodb+srv://<user>:<pass>@cluster.mongodb.net/elv_connect

# JWT
JWT_ACCESS_SECRET=replace_with_64_char_hex
JWT_REFRESH_SECRET=replace_with_different_64_char_hex
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL
CLIENT_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000

# Encryption (for bank details stored in DB)
ENCRYPTION_KEY=replace_with_64_char_hex

# Email (Nodemailer)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=your_smtp_api_key
EMAIL_FROM=noreply@elvconnect.com

# File Upload
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Monitoring
SENTRY_DSN=https://your_sentry_dsn_here
```

### Frontend `.env.example` (Next.js)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
NEXT_PUBLIC_SENTRY_DSN=https://your_public_sentry_dsn
```

---

## 14. Repository Structure

```
elv-connect/
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── app.ts
│   │   ├── config/
│   │   │   ├── env.ts              ← Zod env schema
│   │   │   └── db.ts
│   │   ├── middleware/
│   │   │   ├── requireAuth.ts
│   │   │   ├── validate.ts
│   │   │   ├── roleGuard.ts
│   │   │   ├── checkInvoiceLimit.ts
│   │   │   └── errorHandler.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── invoices/
│   │   │   ├── jobs/
│   │   │   ├── engineers/
│   │   │   ├── amc/
│   │   │   ├── catalog/
│   │   │   └── reports/
│   │   ├── services/
│   │   │   ├── email.service.ts
│   │   │   ├── cron.service.ts
│   │   │   ├── cloudinary.service.ts
│   │   │   └── pdf.service.ts
│   │   └── utils/
│   │       ├── jwt.ts
│   │       ├── encryption.ts
│   │       ├── ownershipCheck.ts
│   │       ├── tokenCompare.ts
│   │       ├── invoiceNumber.ts    ← Auto-generate ELV-2024-0001
│   │       └── seedCatalog.ts      ← Seed ELV item catalog
│   ├── postman/
│   │   ├── collection.json
│   │   └── environment.json
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/                        ← Next.js App Router
│   ├── components/
│   ├── lib/
│   ├── features/
│   ├── public/
│   │   └── elv-logo.svg
│   ├── .env.example
│   ├── .gitignore
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── ELV_CONNECT_PRD.md          ← This file
│   └── API_REFERENCE.md
│
├── .cursorignore
└── README.md
```

### `.gitignore`

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
build/
.next/
out/
*.tsbuildinfo
*.log
coverage/
.nyc_output/
*.pem
*.key
.DS_Store
Thumbs.db
```

### `.cursorignore`

```gitignore
.env
.env.*
!.env.example
node_modules/
dist/
build/
.next/
coverage/
*.pem
*.key
```

---

## 15. Master Build Prompt

Copy this entire prompt into Claude Code or your AI coding assistant to bootstrap the project:

```
Build ELV CONNECT — a production-ready full-stack Invoice Generator SaaS for the
Integrated Security & ELV (Extra Low Voltage) Solutions Industry.

Industry: Integrated Security & ELV Solutions
App Name: ELV CONNECT
Primary Resources: invoices, jobs, engineers (users/service_providers), amc_contracts, catalog_items
User Roles: customer, service_provider, admin

── Tech Stack ────────────────────────────────────────────────────────────
Frontend: Next.js (App Router) + React + TailwindCSS
Backend: Node.js + Express + TypeScript
Auth: Email/Password only (NO OAuth)
Database: MongoDB Atlas + Mongoose
Color Theme: Purple — primary #7C3AED, dark #5B21B6

⚠️ BEFORE writing any package.json: web search each dependency for latest stable
version + security advisories. Confirm with `npm show <pkg> version`. State what
you verified. Never hardcode versions from any blueprint.

── Backend Requirements ──────────────────────────────────────────────────
- Zod-validated env at startup — crash on bad config
- Email/password auth only; JWT access (15min) + refresh (7d) in HttpOnly cookie
- Refresh token rotation + breach detection (reuse = revoke all)
- Account lockout: 5 failed attempts → 15min lock (TTL index on loginAttempts)
- Security: helmet, cors (explicit origins), express-mongo-sanitize, rate-limit
- assertOwnership() in every controller — 404 not 403 for wrong user
- crypto.timingSafeEqual() for all token comparisons
- AES-256-GCM encryption for bank account numbers and IBAN stored in DB
- Freemium enforcement: free plan = 5 invoices/month (middleware on POST /invoices)
- node-cron jobs: (1) mark invoices overdue daily 1AM, (2) AMC reminders daily 8AM,
  (3) reset invoice monthly counter on 1st of month
- PDF generation using @react-pdf/renderer on the backend (/invoices/:id/pdf)
- Email delivery via nodemailer (invoice to customer, AMC reminders)
- File uploads via Cloudinary (backend-signed URLs only)
- MongoDB geospatial index on engineer location (GeoJSON Point) for nearby job matching
- Full-text search on invoices (project name, customer name, invoice number)
- GET /health and GET /ready endpoints
- Winston structured logging — never log passwords, tokens, bank details, or TRN
- Sentry error monitoring with beforeSend scrubbing

── Database Schema ───────────────────────────────────────────────────────
Collections: users, invoices, jobs, amc_contracts, catalog_items, reviews
See full schema in ELV_CONNECT_PRD.md Section 8.

── Frontend Requirements ─────────────────────────────────────────────────
- Next.js App Router with TypeScript
- TailwindCSS with purple design tokens (primary: #7C3AED)
- Auth: email/password only — NO role selection on register page (user picks CUSTOMER
  or SERVICE PROVIDER via "Who are you?" role selector screen)
- Access token in memory (tokenStore.ts) — never localStorage
- Single-flight refresh interceptor with separate refreshClient
- AuthProvider bootstraps session on load
- RequireAuth wrapper on all /dashboard routes
- TanStack Query for all server state
- React Hook Form + Zod for all forms
- Public pages (/, /about, /pricing, /engineers, /jobs, /clients, /engineers/latest)
  are accessible without auth
- Invoice wizard: 7-step guided creation (Type → Customer → Project → Line Items →
  Summary → Terms → Preview & Send)
- Line item table: ELV catalog search, qty/price/VAT editable per row
- Three invoice templates: Classic / Modern / Detailed (all purple-themed)
- Role-aware dashboard: different widgets for customer vs service_provider
- Location page with map showing nearby jobs for engineers
- Public invoice portal (/invoice/:token) — customer can view/download without login
- Responsive: desktop-first but mobile-friendly

── Invoice Number Format ─────────────────────────────────────────────────
Auto-increment per user: ELV-{YEAR}-{4-digit-padded} e.g. ELV-2024-0001
Stored in user document as invoiceCount, incremented atomically.

── ELV Catalog Seed Data ────────────────────────────────────────────────
Seed 30+ common ELV items across categories: cctv, access_control, fire_alarm,
structured_cabling, pa_system, bms, intercom, gate_automation, av_integration.
See ELV_CONNECT_PRD.md Section 7.3 for sample items.

── Pricing Plans ─────────────────────────────────────────────────────────
FREE:     5 invoices/month, 1 user, basic templates
PRO:      Unlimited invoices, all templates, AMC module, PDF export
BUSINESS: Everything in Pro + reports, team members, priority support
(No payment gateway in v1 — show upgrade modal only)

── Pages to Build (from site map) ───────────────────────────────────────
Public: /, /about, /contact, /privacy, /pricing, /clients, /engineers,
        /engineers/latest, /vendors, /jobs, /jobs/nearby, /location,
        /auth/login, /auth/register (with role selector), /auth/forgot-password,
        /auth/reset-password, /invoice/:token (public portal)

Dashboard: /dashboard (role-aware), /dashboard/invoices, /dashboard/invoices/new,
           /dashboard/invoices/:id, /dashboard/jobs, /dashboard/contracts,
           /dashboard/customers, /dashboard/reports, /dashboard/profile,
           /dashboard/settings

── Deliverables ──────────────────────────────────────────────────────────
1. .env.example (backend + frontend) with comments
2. Root .gitignore and .cursorignore
3. README with setup, seed, and run instructions
4. Postman collection + environment under backend/postman/
5. TypeScript strict mode tsconfig.json for both
6. Full API documentation per endpoint
7. Seed script for ELV catalog items
8. GitHub Actions CI: npm ci → typecheck → npm audit
```

---

*ELV CONNECT PRD v1.0 — Ready for development. Follow ⚠️ Version Safety Rule for all dependencies.*