import { Router } from 'express';
import { validate } from '../../middleware/validate';
import * as matchController from './match.controller';
import { locationMatchQuerySchema } from './match.schema';

const router = Router();

// Public: same-location marketplace matching for demand and supply
// GET /api/v1/matches/location
router.get('/location', validate(locationMatchQuerySchema), matchController.getLocationMatches);

export default router;
