import { Router } from 'express';
import { getUserRepos } from '../controllers/user.controller';
import { auth, requireAuth } from '../middleware/auth.middleware';

const router = Router();

// GET /api/user/repos 
router.get('/repos', auth, requireAuth, getUserRepos);

// API Keys 
import { addApiKey, getApiKeys, revalidateApiKey, deleteApiKey, getProfile, updateProfile, getUsageStats, getPreferences, updatePreferences, clearUserData, exportUserData } from '../controllers/user.controller';
router.get('/apikeys', auth, requireAuth, getApiKeys);
router.post('/apikey', auth, requireAuth, addApiKey);
router.patch('/apikey', auth, requireAuth, revalidateApiKey);
router.delete('/apikey/:keyId', auth, requireAuth, deleteApiKey);

// Profile & Settings
router.get('/profile', auth, requireAuth, getProfile);
router.put('/profile', auth, requireAuth, updateProfile);
router.get('/usage', auth, requireAuth, getUsageStats);
router.get('/preferences', auth, requireAuth, getPreferences);
router.put('/preferences', auth, requireAuth, updatePreferences);
router.delete('/data', auth, requireAuth, clearUserData);
router.get('/export', auth, requireAuth, exportUserData);

export default router;
