import { Hono } from 'hono';
import {
  getProfile,
  generate,
  getHistory,
  getStats,
  deleteProfileItem,
} from '../controllers/profile.controller';
import { auth, requireAuth } from '../middleware/auth.middleware';
import { Bindings } from '../index';

type Variables = { user: any; contextStore: any };
export const profileRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

profileRoutes.get('/history', auth, requireAuth, getHistory);
profileRoutes.get('/:username', auth, getProfile);
profileRoutes.post('/generate', auth, generate);
profileRoutes.get('/stats', auth, requireAuth, getStats);
profileRoutes.delete('/:id', auth, requireAuth, deleteProfileItem);
