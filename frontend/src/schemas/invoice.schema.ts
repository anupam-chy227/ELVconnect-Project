import { z } from "zod";
import { ELV_CATEGORIES, INVOICE_TYPES, INVOICE_TEMPLATES } from "@/lib/config";

export const invoiceLineItemSchema = z.object({
  _id: z.string().optional(),
  category: z.enum([
    ...ELV_CATEGORIES,
    "labor",
    "service",
    "amc",
    "variation",
    "other",
  ]),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description too long"),
  unit: z.string().min(1, "Unit is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Unit price must be greater than or equal to 0"),
  discount: z.number().min(0, "Discount must be greater than or equal to 0").optional(),
  vatRate: z.number().min(0).max(100, "VAT rate must be between 0-100").optional(),
});

export const createInvoiceSchema = z.object({
  type: z.enum(INVOICE_TYPES),
  template: z.enum(INVOICE_TEMPLATES),
  to: z.object({
    name: z.string().min(1, "Customer name is required"),
    companyName: z.string().optional(),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    address: z.string().optional(),
    trn: z.string().optional(),
  }),
  projectName: z.string().optional(),
  siteAddress: z.string().optional(),
  poNumber: z.string().optional(),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  currency: z.string().default("AED"),
  lineItems: z
    .array(invoiceLineItemSchema)
    .min(1, "Add at least one line item"),
  globalDiscount: z.number().min(0, "Global discount must be >= 0").default(0),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  retentionPercentage: z
    .number()
    .min(0)
    .max(100, "Retention must be 0-100%")
    .optional(),
});

export type InvoiceLineItemFormData = z.infer<typeof invoiceLineItemSchema>;
export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;
