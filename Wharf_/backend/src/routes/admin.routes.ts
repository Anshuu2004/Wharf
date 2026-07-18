import express from 'express';
import { getDashboardData } from '../controllers/admin.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

const adminAuth = (req: any, res: any, next: any) => {
  const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',');

  const userId = req.user?.userId || req.user?.id;

  if (!userId || !ADMIN_IDS.includes(userId.toString())) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

router.get('/dashboard', auth, adminAuth, getDashboardData);

export default router;
