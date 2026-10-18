import { Router } from 'express';
import { generateReadme, getHistory, getHistoryById, deleteHistoryItem } from '../controllers/generate.controller';
import { auth, requireAuth } from '../middleware/auth.middleware';
import { generationLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/generate/readme
router.post('/readme', generationLimiter, auth, generateReadme);

// GET /api/generate/history
router.get('/history', auth, requireAuth, getHistory);

// GET /api/generate/history/:id
router.get('/history/:id', auth, requireAuth, getHistoryById);

// DELETE /api/generate/history/:id
router.delete('/history/:id', auth, requireAuth, deleteHistoryItem);

export default router;
