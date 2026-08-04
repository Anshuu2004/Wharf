import { Hono } from 'hono';
import { ChangelogController } from '../controllers/changelog.controller';
import { auth, requireAuth } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimiter';
import { Bindings } from '../index';

type Variables = { user: any; contextStore: any };
export const changelogRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const changelogController = new ChangelogController();

changelogRoutes.post('/stats', auth, changelogController.getStats.bind(changelogController));
changelogRoutes.post('/generate', auth, rateLimit, changelogController.generate.bind(changelogController));
changelogRoutes.get('/history', auth, requireAuth, changelogController.getHistory.bind(changelogController));
changelogRoutes.delete('/history/:id', auth, requireAuth, changelogController.deleteChangelog.bind(changelogController));
