import { z } from 'zod';

const ELVCategoryEnum = z.enum([
  'cctv','access_control','fire_alarm','structured_cabling',
  'pa_system','bms','intercom','gate_automation','av_integration','other',
]);

const lineItemSchema = z.object({
  category: z.union([
    ELVCategoryEnum,
    z.enum(['labor','service','amc','variation','other']),
  ]),
  description: z.string().min(1).max(500),
  unit: z.string().min(1).max(50),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).max(100).default(0),
  vatRate: z.number().min(0).default(5),
  catalogItemId: z.string().optional(),
});

export const createInvoiceSchema = z.object({
  body: z.object({
    type: z.enum(['tax_invoice','proforma','boq','amc','progress','credit_note']),
    template: z.enum(['classic','modern','detailed']).default('classic'),
    to: z.object({
      customerId: z.string().optional(),
      name: z.string().min(1),
      companyName: z.string().optional(),
      email: z.string().email(),
      phone: z.string().optional(),
      address: z.string().min(1),
      trn: z.string().optional(),
    }),
    projectName: z.string().optional(),
    siteAddress: z.string().optional(),
    poNumber: z.string().optional(),
    contractRef: z.string().optional(),
    jobId: z.string().optional(),
    invoiceDate: z.string().datetime(),
    dueDate: z.string().datetime(),
    lineItems: z.array(lineItemSchema).min(1),
    currency: z.string().default('AED'),
    globalDiscount: z.number().min(0).max(100).default(0),
    retentionPercentage: z.number().min(0).max(100).default(0),
    paymentTerms: z.enum(['net_15','net_30','due_on_receipt']).default('net_30'),
    notes: z.string().optional(),
    termsAndConditions: z.string().optional(),
    warrantyTerms: z.string().optional(),
    amcDetails: z.object({
      contractId: z.string().optional(),
      contractPeriodStart: z.string().datetime(),
      contractPeriodEnd: z.string().datetime(),
      systemsCovered: z.array(ELVCategoryEnum),
      visitSchedule: z.string(),
    }).optional(),
  }),
});

export const recordPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    method: z.enum(['bank_transfer','cash','cheque','card']),
    date: z.string().datetime(),
    reference: z.string().optional(),
    notes: z.string().optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const updateInvoiceStatusSchema = z.object({
  body: z.object({
    status: z.enum(['draft','sent','viewed','partially_paid','paid','overdue','disputed','cancelled']),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>['body'];
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>['body'];
