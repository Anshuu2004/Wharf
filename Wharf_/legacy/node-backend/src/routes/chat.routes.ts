import { Router } from 'express';
import {
  analyzeRepository,
  sendMessage,
  getHistory,
  getSession,
} from '../controllers/chat.controller';
import { auth, requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Define Routes
router.post('/analyze', auth, analyzeRepository);

// Require Auth For Chat Interaction
router.post('/message', auth, requireAuth, sendMessage);
router.get('/history', auth, requireAuth, getHistory);
router.get('/session/:id', auth, requireAuth, getSession);

export default router;
