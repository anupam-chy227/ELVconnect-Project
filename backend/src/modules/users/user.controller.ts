import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import * as userService from './user.service';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!Types.ObjectId.isValid(req.user!._id)) {
      res.status(200).json({
        success: true,
        data: {
          user: {
            _id: req.user!._id,
            email: req.user!.email,
            role: req.user!.role,
            profile: {
              fullName: req.user!.email.split('@')[0],
              phone: 'Google account',
            },
          },
        },
      });
      return;
    }

    const user = await userService.getProfile(req.user!._id);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) { next(error); }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!Types.ObjectId.isValid(req.user!._id)) {
      const incomingProfile = req.body?.profile || {};
      res.status(200).json({
        success: true,
        data: {
          user: {
            _id: req.user!._id,
            email: req.user!.email,
            role: req.user!.role,
            profile: {
              fullName: incomingProfile.fullName || req.user!.email.split('@')[0],
              companyName: incomingProfile.companyName || '',
              phone: incomingProfile.phone || 'Google account',
              bio: incomingProfile.bio || '',
              avatar: incomingProfile.avatar || '',
            },
          },
        },
      });
      return;
    }

    const user = await userService.updateProfile(req.user!._id, req.body);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) { next(error); }
};

export const updateServiceProviderDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.updateServiceProviderDetails(req.user!._id, req.body);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) { next(error); }
};

export const listEngineers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.listEngineers({
      specialization: req.query.specialization as string,
      city: req.query.city as string,
      lat: req.query.lat as string,
      lng: req.query.lng as string,
      radius: req.query.radius as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.status(200).json({ success: true, ...result });
  } catch (error) { next(error); }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.deleteAccount(req.user!._id, req.body.confirm);
    res.clearCookie('refreshToken', { path: '/' });
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};
