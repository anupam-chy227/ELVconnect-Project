import { Invoice, IInvoice } from './invoice.model';
import { User } from '../users/user.model';
import { CreateInvoiceInput, RecordPaymentInput } from './invoice.schema';
import { Types } from 'mongoose';

// ── Helper: compute financials from line items ────────────────────────────
const computeFinancials = (
  lineItems: CreateInvoiceInput['lineItems'],
  globalDiscount: number,
  retentionPercentage: number
) => {
  let subtotal = 0;
  let totalVat = 0;

  const computed = lineItems.map((item) => {
    const lineTotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
    const vatAmount = lineTotal * (item.vatRate / 100);
    const lineTotalWithVat = lineTotal + vatAmount;
    subtotal += lineTotal;
    totalVat += vatAmount;
    return { ...item, lineTotal, vatAmount, lineTotalWithVat };
  });

  const globalDiscountAmount = subtotal * (globalDiscount / 100);
  const taxableAmount = subtotal - globalDiscountAmount;
  const vatOnTaxable = taxableAmount * 0.05; // recompute on discounted amount
  const retentionAmount = (taxableAmount + vatOnTaxable) * (retentionPercentage / 100);
  const grandTotal = taxableAmount + vatOnTaxable - retentionAmount;

  return {
    computed,
    subtotal,
    globalDiscountAmount,
    taxableAmount,
    vatAmount: vatOnTaxable,
    retentionAmount,
    grandTotal,
  };
};

// ── Create Invoice ─────────────────────────────────────────────────────────
export const createInvoice = async (userId: string, data: CreateInvoiceInput) => {
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404, code: 'NOT_FOUND' });

  // Check free-tier limit (5 invoices/month)
  if (user.subscription.plan === 'free' && user.subscription.invoicesThisMonth >= 5) {
    throw Object.assign(
      new Error('Free plan limit reached — upgrade to Pro for unlimited invoices'),
      { statusCode: 403, code: 'FORBIDDEN' }
    );
  }

  const { computed, ...financials } = computeFinancials(
    data.lineItems,
    data.globalDiscount ?? 0,
    data.retentionPercentage ?? 0
  );

  const invoice = await Invoice.create({
    userId: new Types.ObjectId(userId),
    type: data.type,
    template: data.template,
    from: {
      name: user.profile.fullName,
      companyName: user.profile.companyName,
      email: user.email,
      phone: user.profile.phone,
      address: user.serviceProvider?.serviceArea?.city || 'N/A',
      trn: user.businessDetails?.trn,
      bankName: user.businessDetails?.bankName,
    },
    to: data.to,
    projectName: data.projectName,
    siteAddress: data.siteAddress,
    poNumber: data.poNumber,
    contractRef: data.contractRef,
    jobId: data.jobId ? new Types.ObjectId(data.jobId) : undefined,
    invoiceDate: new Date(data.invoiceDate),
    dueDate: new Date(data.dueDate),
    lineItems: computed,
    currency: data.currency,
    globalDiscount: data.globalDiscount ?? 0,
    retentionPercentage: data.retentionPercentage ?? 0,
    paymentTerms: data.paymentTerms,
    notes: data.notes,
    termsAndConditions: data.termsAndConditions,
    warrantyTerms: data.warrantyTerms,
    amcDetails: data.amcDetails,
    balanceDue: financials.grandTotal,
    ...financials,
  });

  // Increment monthly invoice counter
  await User.findByIdAndUpdate(userId, { $inc: { 'subscription.invoicesThisMonth': 1 } });

  return invoice;
};

// ── List Invoices ──────────────────────────────────────────────────────────
export const listInvoices = async (
  userId: string,
  query: { status?: string; page?: number; limit?: number }
) => {
  const filter: any = { userId: new Types.ObjectId(userId) };
  if (query.status) filter.status = query.status;

  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Invoice.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-portalToken'),
    Invoice.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ── Get Single Invoice ─────────────────────────────────────────────────────
export const getInvoice = async (invoiceId: string, userId: string) => {
  const invoice = await Invoice.findOne({
    _id: new Types.ObjectId(invoiceId),
    userId: new Types.ObjectId(userId),
  }).select('-portalToken');

  if (!invoice) throw Object.assign(new Error('Invoice not found'), { statusCode: 404, code: 'NOT_FOUND' });
  return invoice;
};

// ── Update Invoice Status ──────────────────────────────────────────────────
export const updateInvoiceStatus = async (
  invoiceId: string,
  userId: string,
  status: IInvoice['status']
) => {
  const invoice = await Invoice.findOneAndUpdate(
    { _id: new Types.ObjectId(invoiceId), userId: new Types.ObjectId(userId) },
    {
      status,
      ...(status === 'sent' ? { sentAt: new Date() } : {}),
      ...(status === 'viewed' ? { viewedAt: new Date() } : {}),
    },
    { new: true }
  );
  if (!invoice) throw Object.assign(new Error('Invoice not found'), { statusCode: 404, code: 'NOT_FOUND' });
  return invoice;
};

// ── Record Payment ─────────────────────────────────────────────────────────
export const recordPayment = async (
  invoiceId: string,
  userId: string,
  data: RecordPaymentInput
) => {
  const invoice = await Invoice.findOne({
    _id: new Types.ObjectId(invoiceId),
    userId: new Types.ObjectId(userId),
  });
  if (!invoice) throw Object.assign(new Error('Invoice not found'), { statusCode: 404, code: 'NOT_FOUND' });

  invoice.payments.push({
    date: new Date(data.date),
    amount: data.amount,
    method: data.method as any,
    reference: data.reference,
    notes: data.notes,
    recordedAt: new Date(),
  });

  invoice.totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  invoice.balanceDue = invoice.grandTotal - invoice.totalPaid;

  if (invoice.balanceDue <= 0) {
    invoice.status = 'paid';
  } else if (invoice.totalPaid > 0) {
    invoice.status = 'partially_paid';
  }

  await invoice.save();
  return invoice;
};

// ── Soft Delete ────────────────────────────────────────────────────────────
export const deleteInvoice = async (invoiceId: string, userId: string) => {
  const invoice = await Invoice.findOneAndUpdate(
    { _id: new Types.ObjectId(invoiceId), userId: new Types.ObjectId(userId), status: 'draft' },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
  if (!invoice) throw Object.assign(new Error('Only draft invoices can be deleted'), { statusCode: 400, code: 'INVALID_REQUEST' });
  return { message: 'Invoice deleted' };
};

// ── Mark Overdue (called by cron) ─────────────────────────────────────────
export const markOverdueInvoices = async () => {
  const result = await Invoice.updateMany(
    { status: 'sent', dueDate: { $lt: new Date() } },
    { status: 'overdue' }
  );
  return result.modifiedCount;
};
