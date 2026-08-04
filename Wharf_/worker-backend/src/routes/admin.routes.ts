import { Hono, Next } from 'hono';
import { getDashboardData, getPublicStats } from '../controllers/admin.controller';
import { AdminAnnouncementController } from '../controllers/announcement.controller';
import { auth } from '../middleware/auth.middleware';
import { Bindings } from '../index';

type Variables = { user: any; contextStore: any };
export const adminRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const adminAuth = async (c: any, next: Next) => {
  // Access Global Env Var On c.env Since process.env Is Not Defined
  const ADMIN_IDS = (c.env.ADMIN_IDS || '').split(',');
  const user = c.get('user');
  const userId = user?.userId || user?.id;

  if (!userId || !ADMIN_IDS.includes(userId.toString())) {
    return c.json({ error: 'Admin access required' }, 403);
  }
  await next();
};

adminRoutes.get('/public-stats', getPublicStats);
adminRoutes.get('/dashboard', auth, adminAuth, getDashboardData);

// Announcements
adminRoutes.get('/announcements', auth, adminAuth, AdminAnnouncementController.getAll);
adminRoutes.post('/announcements', auth, adminAuth, AdminAnnouncementController.create);
adminRoutes.put('/announcements/:id', auth, adminAuth, AdminAnnouncementController.update);
adminRoutes.patch('/announcements/:id/publish', auth, adminAuth, AdminAnnouncementController.togglePublish);
adminRoutes.delete('/announcements/:id', auth, adminAuth, AdminAnnouncementController.delete);
