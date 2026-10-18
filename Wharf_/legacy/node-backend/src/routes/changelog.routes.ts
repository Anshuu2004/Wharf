import { Router } from 'express';
import { ChangelogController } from '../controllers/changelog.controller';
import { auth, requireAuth } from '../middleware/auth.middleware';
import { anonymousAnalysisLimiter } from '../middleware/rateLimiter';

const router = Router();
const controller = new ChangelogController();

// Using Basic Public Routes
router.post('/stats', auth, anonymousAnalysisLimiter, controller.getStats.bind(controller));
router.post('/generate', auth, anonymousAnalysisLimiter, controller.generate.bind(controller));

// Protected Routes
router.get('/history', auth, requireAuth, controller.getHistory.bind(controller));
router.delete('/:id', auth, requireAuth, controller.deleteChangelog.bind(controller));

export default router;
