import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import invoiceRoutes from './modules/invoices/invoice.routes';
import jobRoutes from './modules/jobs/job.routes';
import aiRoutes from './routes/aiRoutes';
import { isDBConnected } from './config/db';
import { env } from './config/env';

const router = Router();

router.use('/auth', authRoutes);
router.use('/ai', aiRoutes);

router.use((req, res, next) => {
  if (isDBConnected() || env.NODE_ENV !== 'development') {
    next();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'MongoDB is offline in development; returning an empty result.',
      data: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0, totalPages: 0 },
    });
    return;
  }

  res.status(503).json({
    success: false,
    error: {
      code: 'DATABASE_OFFLINE',
      message: 'MongoDB is offline. Add your current IP in MongoDB Atlas Network Access, then retry.',
    },
  });
});

router.use('/users', userRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/jobs', jobRoutes);

export default router;
