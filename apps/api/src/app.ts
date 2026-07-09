import express from 'express';
import { corsMiddleware } from './config/cors.js';
import { requestLogger } from './middleware/requestLogger.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import { authRoutes } from './modules/auth/auth.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { accountsRoutes } from './modules/accounts/accounts.routes.js';
import { tradesRoutes } from './modules/trades/trades.routes.js';
import { transactionsRoutes } from './modules/transactions/transactions.routes.js';
import { aiRoutes } from './modules/ai/ai.routes.js';
import { leaderboardRoutes } from './modules/leaderboard/leaderboard.routes.js';
import { newsRoutes } from './modules/news/news.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { platformRoutes } from './modules/platform/platform.routes.js';
import { marketRoutes } from './modules/market/market.routes.js';
import { kycRoutes } from './modules/kyc/kyc.routes.js';

export function createApp() {
  const app = express();

  // Global middleware
  app.use(corsMiddleware);
  app.use(express.json({ limit: '10mb' }));
  app.use(requestLogger);
  app.use(generalLimiter);

  // Health check
  app.get('/api/v1/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  });

  // Mount routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', usersRoutes);
  app.use('/api/v1/accounts', accountsRoutes);
  app.use('/api/v1/trades', tradesRoutes);
  app.use('/api/v1/transactions', transactionsRoutes);
  app.use('/api/v1/ai', aiRoutes);
  app.use('/api/v1/leaderboard', leaderboardRoutes);
  app.use('/api/v1/news', newsRoutes);
  app.use('/api/v1/market', marketRoutes);
  app.use('/api/v1/kyc', kycRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/admin/settings', platformRoutes);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
