import { Hono } from 'hono';
import { githubLogin, githubCallback, getMe, logout } from '../controllers/auth.controller';
import { auth as authMiddleware } from '../middleware/auth.middleware';
import { Bindings } from '../index';

export const authRoutes = new Hono<{ Bindings: Bindings }>();

authRoutes.get('/github', githubLogin);
authRoutes.get('/github/callback', githubCallback);
authRoutes.get('/me', authMiddleware, getMe as any);
authRoutes.post('/logout', logout);
