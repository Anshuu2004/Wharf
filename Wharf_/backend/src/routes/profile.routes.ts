import { Router } from 'express';
import {
  getProfile,
  generate,
  getHistory,
  getStats,
  deleteProfileItem,
} from '../controllers/profile.controller';
import { auth, requireAuth } from '../middleware/auth.middleware';
import { generationLimiter } from '../middleware/rateLimiter';

const router = Router();

// GET /api/profile/history
router.get('/history', auth, requireAuth, getHistory);

// GET /api/profile/:username
router.get('/:username', auth, getProfile);

// POST /api/profile/generate
router.post('/generate', generationLimiter, auth, generate);

// GET /api/profile/stats
router.get('/stats', auth, requireAuth, getStats);

// DELETE /api/profile/:id
router.delete('/:id', auth, requireAuth, deleteProfileItem);

export default router;
