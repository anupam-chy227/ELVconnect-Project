import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import * as jobService from './job.service';

const str = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

export const createJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await jobService.createJob(req.user!._id, req.body);
    res.status(201).json({ success: true, data: { job } });
  } catch (error) { next(error); }
};

export const listJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await jobService.listJobs({
      lat: str(req.query.lat as string | string[]),
      lng: str(req.query.lng as string | string[]),
      radius: str(req.query.radius as string | string[]),
      city: str(req.query.city as string | string[]),
      category: str(req.query.category as string | string[]),
      status: str(req.query.status as string | string[]),
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.status(200).json({ success: true, ...result });
  } catch (error) { next(error); }
};

export const getJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await jobService.getJob(str(req.params.id));
    res.status(200).json({ success: true, data: { job } });
  } catch (error) { next(error); }
};

export const applyToJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await jobService.applyToJob(str(req.params.id), req.user!._id, req.body);
    res.status(200).json({ success: true, data: { job } });
  } catch (error) { next(error); }
};

export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await jobService.updateApplicationStatus(
      str(req.params.id),
      req.user!._id,
      str(req.body.applicationId),
      req.body.status
    );
    res.status(200).json({ success: true, data: { job } });
  } catch (error) { next(error); }
};

export const myJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!Types.ObjectId.isValid(req.user!._id)) {
      res.status(200).json({
        success: true,
        data: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      });
      return;
    }

    const result = await jobService.myJobs(
      req.user!._id,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 20
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) { next(error); }
};

export const nearbyJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await jobService.nearbyJobs(req.user!._id, Number(req.query.radius) || 25);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const deleteJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await jobService.deleteJob(str(req.params.id), req.user!._id);
    res.status(200).json({ success: true, data: { message: 'Job deleted successfully' } });
  } catch (error) { next(error); }
};
