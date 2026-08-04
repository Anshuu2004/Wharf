import { Hono } from 'hono';
import { 
  getUserRepos, 
  addApiKey, 
  getApiKeys, 
  revalidateApiKey, 
  deleteApiKey, 
  getProfile, 
  updateProfile, 
  getUsageStats, 
  getPreferences, 
  updatePreferences, 
  clearUserData, 
  exportUserData 
} from '../controllers/user.controller';
import { auth, requireAuth } from '../middleware/auth.middleware';
import { UserNotificationController } from '../controllers/announcement.controller';
import { Bindings } from '../index';

type Variables = { user: any; contextStore: any };
export const userRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// GET /api/user/repos 
userRoutes.get('/repos', auth, requireAuth, getUserRepos);

// API Keys 
userRoutes.get('/apikeys', auth, requireAuth, getApiKeys);
userRoutes.post('/apikey', auth, requireAuth, addApiKey);
userRoutes.patch('/apikey', auth, requireAuth, revalidateApiKey);
userRoutes.delete('/apikey/:keyId', auth, requireAuth, deleteApiKey);

// Profile & Settings
userRoutes.get('/profile', auth, requireAuth, getProfile);
userRoutes.put('/profile', auth, requireAuth, updateProfile);
userRoutes.get('/usage', auth, requireAuth, getUsageStats);
userRoutes.get('/preferences', auth, requireAuth, getPreferences);
userRoutes.put('/preferences', auth, requireAuth, updatePreferences);
userRoutes.delete('/data', auth, requireAuth, clearUserData);
userRoutes.get('/export', auth, requireAuth, exportUserData);

// Notifications
userRoutes.get('/notifications', auth, requireAuth, UserNotificationController.getList);
userRoutes.get('/notifications/unread-count', auth, requireAuth, UserNotificationController.getUnreadCount);
userRoutes.post('/notifications/read-all', auth, requireAuth, UserNotificationController.markAllAsRead);
userRoutes.post('/notifications/:id/read', auth, requireAuth, UserNotificationController.markAsRead);
