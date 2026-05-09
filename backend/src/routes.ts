import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import invoiceRoutes from './modules/invoices/invoice.routes';
import jobRoutes from './modules/jobs/job.routes';
import matchRoutes from './modules/matches/match.routes';
import translateRoutes from './modules/translate/translate.routes';
import aiRoutes from './routes/aiRoutes';
import { isDBConnected } from './config/db';
import { env } from './config/env';

const router = Router();

router.use('/auth', authRoutes);
router.use('/ai', aiRoutes);
router.use('/translate', translateRoutes);

router.use((req, res, next) => {
  if (isDBConnected() || env.NODE_ENV !== 'development') {
    next();
    return;
  }

  if (req.method === 'GET') {
    if (req.path.startsWith('/matches/location')) {
      res.status(200).json({
        success: true,
        data: {
          location: { name: 'All India', radiusKm: 100, mode: 'all' },
          engineers: [],
          vendors: [],
          jobs: [],
          clients: [],
          customers: [],
          counts: { engineers: 0, vendors: 0, jobs: 0, clients: 0, customers: 0 },
          signals: { locationMode: 'all', sameCityOnly: false, sameRadiusOnly: false, category: null },
        },
      });
      return;
    }

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
router.use('/matches', matchRoutes);

export default router;
