import { Router } from 'express';
import { githubLogin, githubCallback, getMe, logout } from '../controllers/auth.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

router.get('/github', githubLogin);
router.get('/github/callback', githubCallback);
router.get('/me', auth, getMe);
router.post('/logout', logout);

export default router;
