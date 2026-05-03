import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import * as invoiceService from './invoice.service';

const str = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

export const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.createInvoice(req.user!._id, req.body);
    res.status(201).json({ success: true, data: { invoice } });
  } catch (error) { next(error); }
};

export const listInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!Types.ObjectId.isValid(req.user!._id)) {
      res.status(200).json({
        success: true,
        data: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      });
      return;
    }

    const result = await invoiceService.listInvoices(req.user!._id, {
      status: str(req.query.status as string | string[]),
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.status(200).json({ success: true, ...result });
  } catch (error) { next(error); }
};

export const getInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.getInvoice(str(req.params.id), req.user!._id);
    res.status(200).json({ success: true, data: { invoice } });
  } catch (error) { next(error); }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.updateInvoiceStatus(str(req.params.id), req.user!._id, req.body.status);
    res.status(200).json({ success: true, data: { invoice } });
  } catch (error) { next(error); }
};

export const recordPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.recordPayment(str(req.params.id), req.user!._id, req.body);
    res.status(200).json({ success: true, data: { invoice } });
  } catch (error) { next(error); }
};

export const deleteInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await invoiceService.deleteInvoice(str(req.params.id), req.user!._id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};
