import express from 'express';
import { getDashboardData, getPublicStats } from '../controllers/admin.controller';
import { AdminAnnouncementController } from '../controllers/announcement.controller';
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

router.get('/public-stats', getPublicStats);
router.get('/dashboard', auth, adminAuth, getDashboardData);

// Announcements
router.get('/announcements', auth, adminAuth, AdminAnnouncementController.getAll);
router.post('/announcements', auth, adminAuth, AdminAnnouncementController.create);
router.put('/announcements/:id', auth, adminAuth, AdminAnnouncementController.update);
router.patch(
  '/announcements/:id/publish',
  auth,
  adminAuth,
  AdminAnnouncementController.togglePublish
);
router.delete('/announcements/:id', auth, adminAuth, AdminAnnouncementController.delete);

export default router;
