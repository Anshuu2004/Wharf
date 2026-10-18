import { Hono } from 'hono';
import { analyzeRepository, sendMessage, getHistory, getSession } from '../controllers/chat.controller';
import { auth, requireAuth } from '../middleware/auth.middleware';
import { Bindings } from '../index';

type Variables = { user: any; contextStore: any };
export const chatRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

chatRoutes.post('/analyze', auth, requireAuth, analyzeRepository);
chatRoutes.post('/message', auth, requireAuth, sendMessage);
chatRoutes.get('/history', auth, requireAuth, getHistory);
chatRoutes.get('/session/:id', auth, requireAuth, getSession);
