import { Hono } from 'hono';
import { generateReadme, getHistory, getHistoryById, deleteHistoryItem } from '../controllers/generate.controller';
import { auth, requireAuth } from '../middleware/auth.middleware';
import { Bindings } from '../index';

type Variables = { user: any; contextStore: any };
export const generateRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

generateRoutes.post('/readme', auth, generateReadme as any);
generateRoutes.get('/history', auth, requireAuth, getHistory as any);
generateRoutes.get('/history/:id', auth, requireAuth, getHistoryById as any);
generateRoutes.delete('/history/:id', auth, requireAuth, deleteHistoryItem as any);
