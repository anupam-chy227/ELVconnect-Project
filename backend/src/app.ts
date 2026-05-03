import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import router from './routes';

const app = express();

// Health & readiness checks (before heavy middleware, no auth, no rate limit)
app.get('/', (_req, res) => {
  res.send('ELV Backend Live 🚀');
});
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.get('/ready', (_req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mongoose = require('mongoose');
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not ready' });
});

// 1. Security headers
app.use(helmet());

// 2. CORS
app.use(cors({
  origin: (origin, callback) => {
    const allowed = new Set([
      env.CLIENT_URL,
      ...env.CORS_ORIGINS.split(',').map((o) => o.trim()),
      ...(env.NODE_ENV === 'development'
        ? [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3001',
            'http://localhost:3004',
            'http://127.0.0.1:3004',
          ]
        : []),
    ]);
    if (!origin || allowed.has(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// 3. Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// 4. Cookie parsing (for HttpOnly refresh token)
app.use(cookieParser());

// Express 5 makes req.query immutable. This breaks express-mongo-sanitize.
app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});

// 5. NoSQL injection prevention
app.use(mongoSanitize());

// 6. HTTP request logging (dev only)
if (env.NODE_ENV === 'development') app.use(morgan('dev'));

// 7. Global rate limit
const globalLimiter = rateLimit({
  windowMs: 60_000,
  max: env.NODE_ENV === 'development' ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } },
});
app.use('/api', globalLimiter);

// 8. Strict auth-route rate limit
const authLimiter = rateLimit({
  windowMs: 60_000,
  max: env.NODE_ENV === 'development' ? 200 : 10,
  skipSuccessfulRequests: true,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many auth attempts' } },
});
app.use('/api/v1/auth', authLimiter);

// 9. Mount all routes
app.use('/api/v1', router);

// 10. Central error handler (always last)
app.use(errorHandler);

export default app;
