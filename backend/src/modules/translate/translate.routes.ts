import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { translateBatch } from './translate.controller';
import { translateBatchSchema } from './translate.schema';

const router = Router();

router.post('/batch', validate(translateBatchSchema), translateBatch);

export default router;
