import { Hono } from 'hono';
import { analyzeRepo, getRepo } from '../controllers/repo.controller';
import { auth, requireAuth } from '../middleware/auth.middleware';
import { Bindings } from '../index';

type Variables = { user: any; contextStore: any };
export const repoRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// NOTE: Replace Express Rate Limiters
// router.post('/analyze', analysisLimiter, auth, anonymousAnalysisLimiter, analyzeRepo);
repoRoutes.post('/analyze', auth, analyzeRepo);
repoRoutes.get('/:id', getRepo);
