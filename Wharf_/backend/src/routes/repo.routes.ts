import { Router } from 'express';
import { analyzeRepo } from '../controllers/repo.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

// POST /api/repo/analyze
router.post('/analyze', auth, analyzeRepo);

export default router;
