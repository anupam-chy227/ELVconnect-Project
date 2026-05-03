import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/requireAuth';
import {
  registerCustomerSchema,
  registerServiceProviderSchema,
  loginSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema';

const router = Router();

// POST /api/v1/auth/register/customer
router.post('/register/customer', validate(registerCustomerSchema), authController.registerCustomer);

// POST /api/v1/auth/register/service-provider
router.post('/register/service-provider', validate(registerServiceProviderSchema), authController.registerServiceProvider);

// POST /api/v1/auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /api/v1/auth/google
router.post('/google', validate(googleAuthSchema), authController.googleAuth);

// Browser redirect fallback for Google OAuth
router.get('/google/setup', authController.googleSetup);
router.get('/google/start', authController.googleStart);
router.get('/google/callback', authController.googleCallback);

// POST /api/v1/auth/refresh
router.post('/refresh', authController.refresh);

// POST /api/v1/auth/logout
router.post('/logout', requireAuth, authController.logout);

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

// POST /api/v1/auth/reset-password
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// GET /api/v1/auth/me
router.get('/me', requireAuth, authController.getMe);

export default router;
