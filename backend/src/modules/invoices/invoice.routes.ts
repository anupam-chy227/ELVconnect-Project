import { Router } from 'express';
import * as invoiceController from './invoice.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { roleGuard } from '../../middleware/roleGuard';
import { validate } from '../../middleware/validate';
import {
  createInvoiceSchema,
  recordPaymentSchema,
  updateInvoiceStatusSchema,
} from './invoice.schema';

const router = Router();

// All invoice routes require authentication
router.use(requireAuth);

// GET /api/v1/invoices
router.get('/', invoiceController.listInvoices);

// POST /api/v1/invoices
router.post('/', roleGuard('customer', 'service_provider', 'admin'), validate(createInvoiceSchema), invoiceController.createInvoice);

// GET /api/v1/invoices/:id
router.get('/:id', invoiceController.getInvoice);

// PATCH /api/v1/invoices/:id/status
router.patch('/:id/status', roleGuard('service_provider', 'admin'), validate(updateInvoiceStatusSchema), invoiceController.updateStatus);

// POST /api/v1/invoices/:id/payments
router.post('/:id/payments', roleGuard('service_provider', 'admin'), validate(recordPaymentSchema), invoiceController.recordPayment);

// DELETE /api/v1/invoices/:id  (soft delete — draft only)
router.delete('/:id', roleGuard('service_provider', 'admin'), invoiceController.deleteInvoice);

export default router;
