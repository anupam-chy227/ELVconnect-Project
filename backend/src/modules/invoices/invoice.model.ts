import mongoose, { Document, Schema, Types } from 'mongoose';
import { ELVCategory } from '../users/user.model';

type InvoiceType = 'tax_invoice' | 'proforma' | 'boq' | 'amc' | 'progress' | 'credit_note';
type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partially_paid' | 'paid' | 'overdue' | 'disputed' | 'cancelled';
type InvoiceTemplate = 'classic' | 'modern' | 'detailed';
type LineItemCategory = ELVCategory | 'labor' | 'service' | 'amc' | 'variation' | 'other';
type PaymentMethod = 'bank_transfer' | 'cash' | 'cheque' | 'card';

export interface IInvoice extends Document {
  invoiceNumber: string;
  userId: Types.ObjectId;
  type: InvoiceType;
  status: InvoiceStatus;
  template: InvoiceTemplate;
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
    customerId?: Types.ObjectId;
    name: string;
    companyName?: string;
    email: string;
    phone?: string;
    address: string;
    trn?: string;
  };
  projectName?: string;
  siteAddress?: string;
  poNumber?: string;
  contractRef?: string;
  jobId?: Types.ObjectId;
  invoiceDate: Date;
  dueDate: Date;
  sentAt?: Date;
  viewedAt?: Date;
  lineItems: Array<{
    _id: Types.ObjectId;
    category: LineItemCategory;
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    vatRate: number;
    lineTotal: number;
    vatAmount: number;
    lineTotalWithVat: number;
    catalogItemId?: Types.ObjectId;
  }>;
  currency: string;
  subtotal: number;
  globalDiscount: number;
  globalDiscountAmount: number;
  taxableAmount: number;
  vatAmount: number;
  retentionPercentage: number;
  retentionAmount: number;
  grandTotal: number;
  payments: Array<{
    date: Date;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
    recordedAt: Date;
  }>;
  totalPaid: number;
  balanceDue: number;
  paymentTerms: string;
  notes?: string;
  termsAndConditions?: string;
  warrantyTerms?: string;
  amcDetails?: {
    contractId?: Types.ObjectId;
    contractPeriodStart: Date;
    contractPeriodEnd: Date;
    systemsCovered: ELVCategory[];
    visitSchedule: string;
  };
  portalToken?: string;
  portalTokenExpires?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const lineItemSchema = new Schema({
  category: {
    type: String,
    enum: ['cctv', 'access_control', 'fire_alarm', 'structured_cabling', 'pa_system', 'bms',
      'intercom', 'gate_automation', 'av_integration', 'other', 'labor', 'service', 'amc', 'variation'],
    required: true,
  },
  description: { type: String, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  vatRate: { type: Number, default: 5, min: 0 },
  lineTotal: { type: Number, required: true },
  vatAmount: { type: Number, required: true },
  lineTotalWithVat: { type: Number, required: true },
  catalogItemId: { type: Schema.Types.ObjectId, ref: 'CatalogItem' },
});

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['tax_invoice', 'proforma', 'boq', 'amc', 'progress', 'credit_note'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'viewed', 'partially_paid', 'paid', 'overdue', 'disputed', 'cancelled'],
      default: 'draft',
    },
    template: {
      type: String,
      enum: ['classic', 'modern', 'detailed'],
      default: 'classic',
    },

    // Parties
    from: {
      name: { type: String, required: true },
      companyName: String,
      email: { type: String, required: true },
      phone: String,
      address: { type: String, required: true },
      trn: String,
      logo: String,
      bankName: String,
      bankAccount: String,
      iban: String,
    },
    to: {
      customerId: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true },
      companyName: String,
      email: { type: String, required: true },
      phone: String,
      address: { type: String, required: true },
      trn: String,
    },

    // Project
    projectName: String,
    siteAddress: String,
    poNumber: String,
    contractRef: String,
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },

    // Dates
    invoiceDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    sentAt: Date,
    viewedAt: Date,

    // Line items
    lineItems: [lineItemSchema],

    // Financials
    currency: { type: String, default: 'AED' },
    subtotal: { type: Number, default: 0 },
    globalDiscount: { type: Number, default: 0, min: 0, max: 100 },
    globalDiscountAmount: { type: Number, default: 0 },
    taxableAmount: { type: Number, default: 0 },
    vatAmount: { type: Number, default: 0 },
    retentionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    retentionAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    // Payments
    payments: [
      {
        date: { type: Date, required: true },
        amount: { type: Number, required: true },
        method: { type: String, enum: ['bank_transfer', 'cash', 'cheque', 'card'] },
        reference: String,
        notes: String,
        recordedAt: { type: Date, default: Date.now },
      },
    ],
    totalPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },

    // Terms
    paymentTerms: { type: String, default: 'net_30' },
    notes: String,
    termsAndConditions: String,
    warrantyTerms: String,

    // AMC
    amcDetails: {
      contractId: { type: Schema.Types.ObjectId },
      contractPeriodStart: Date,
      contractPeriodEnd: Date,
      systemsCovered: [String],
      visitSchedule: String,
    },

    // Portal sharing
    portalToken: { type: String, select: false },
    portalTokenExpires: Date,

    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────
invoiceSchema.index({ userId: 1, status: 1 });
invoiceSchema.index({ 'to.customerId': 1 });
invoiceSchema.index({ dueDate: 1, status: 1 }); // For overdue cron
invoiceSchema.index({ isDeleted: 1 });
invoiceSchema.index({ portalToken: 1 });

// ── Auto invoice number generator ────────────────────────────────────────
invoiceSchema.pre('validate', async function () {
  if (this.isNew && !this.invoiceNumber) {
    const year = new Date().getFullYear();
    const count = await (this.constructor as typeof Invoice).countDocuments({
      invoiceNumber: new RegExp(`^ELV-${year}-`),
    });
    this.invoiceNumber = `ELV-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

// ── Soft-delete filter ────────────────────────────────────────────────────
invoiceSchema.pre(/^find/, function (this: any) {
  if (!this.getQuery().isDeleted) this.where({ isDeleted: false });
});

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);
