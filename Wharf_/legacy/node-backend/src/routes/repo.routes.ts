import { Router } from 'express';
import { analyzeRepo } from '../controllers/repo.controller';
import { auth } from '../middleware/auth.middleware';
import { analysisLimiter, anonymousAnalysisLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/repo/analyze
router.post('/analyze', analysisLimiter, auth, anonymousAnalysisLimiter, analyzeRepo);

export default router;
