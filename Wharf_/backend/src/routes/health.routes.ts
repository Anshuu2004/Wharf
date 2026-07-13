import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';
import { auth, requireAuth } from '../middleware/auth.middleware';
import { rateLimit } from 'express-rate-limit';
import { anonymousAnalysisLimiter } from '../middleware/rateLimiter';

const router = Router();
const healthController = new HealthController();

// Rate Limiting For Unauthenticated Users
const rateLimitMiddleware = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 Minute
  max: 10, // 10 Requests Per Minute
  message: { success: false, error: 'Too many requests, please try again later.' },
});

// Public Routes (With Rate Limiting)
router.post(
  '/score',
  auth,
  rateLimitMiddleware,
  anonymousAnalysisLimiter,
  healthController.analyzeReadmeHealth.bind(healthController)
);
router.post(
  '/contribution',
  auth,
  rateLimitMiddleware,
  anonymousAnalysisLimiter,
  healthController.analyzeContributionReadiness.bind(healthController)
);

// Protected Routes
router.get('/history', auth, requireAuth, healthController.getHistory.bind(healthController));
router.delete(
  '/history/:id',
  auth,
  requireAuth,
  healthController.deleteHistory.bind(healthController)
);

export default router;
