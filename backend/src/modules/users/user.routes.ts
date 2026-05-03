import { Router } from 'express';
import * as userController from './user.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { roleGuard } from '../../middleware/roleGuard';

const router = Router();

// Public: browse engineers directory
// GET /api/v1/users/engineers
router.get('/engineers', userController.listEngineers);

// Authenticated routes
router.use(requireAuth);

// GET /api/v1/users/me
router.get('/me', userController.getProfile);

// PATCH /api/v1/users/me
router.patch('/me', userController.updateProfile);

// PATCH /api/v1/users/me/service-provider
router.patch('/me/service-provider', roleGuard('service_provider'), userController.updateServiceProviderDetails);

// DELETE /api/v1/users/me  — requires confirm body: { confirm: "DELETE MY ACCOUNT" }
router.delete('/me', userController.deleteAccount);

export default router;
