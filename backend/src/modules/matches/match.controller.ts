import { Request, Response, NextFunction } from 'express';
import * as matchService from './match.service';

const str = (value: string | string[] | undefined): string => (Array.isArray(value) ? value[0] : value) ?? '';

export const getLocationMatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await matchService.getLocationMatches({
      city: str(req.query.city as string | string[]),
      lat: str(req.query.lat as string | string[]),
      lng: str(req.query.lng as string | string[]),
      radius: str(req.query.radius as string | string[]),
      category: str(req.query.category as string | string[]),
      limit: Number(req.query.limit) || undefined,
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
