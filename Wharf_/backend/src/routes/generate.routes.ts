import { Router } from 'express';
import { generateReadme } from '../controllers/generate.controller';
import { auth } from '../middleware/auth.middleware';
import { generationLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/generate/readme
router.post('/readme', generationLimiter, auth, generateReadme);

export default router;
