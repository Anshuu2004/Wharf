import { Router } from 'express';
import { getUserRepos } from '../controllers/user.controller';
import { auth, requireAuth } from '../middleware/auth.middleware';

const router = Router();

// GET /api/user/repos - Fetch lLgged In User's GitHub Repositories
router.get('/repos', auth, requireAuth, getUserRepos);

export default router;
