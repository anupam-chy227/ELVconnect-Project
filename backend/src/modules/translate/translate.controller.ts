import { Request, Response, NextFunction } from 'express';
import { translateBatchBodySchema } from './translate.schema';
import { getBatchTranslations } from './translate.service';

export const translateBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = translateBatchBodySchema.parse(req.body);
    const translations = await getBatchTranslations(input);

    res.status(200).json({
      success: true,
      data: { translations },
    });
  } catch (error) {
    next(error);
  }
};
