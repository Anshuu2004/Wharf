import { Router } from 'express';
import { analyzeRepo } from '../controllers/repo.controller';
import { auth } from '../middleware/auth.middleware';
import { analysisLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/repo/analyze
router.post('/analyze', analysisLimiter, auth, analyzeRepo);

export default router;
