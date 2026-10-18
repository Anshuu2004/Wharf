import request from 'supertest';
import app from '../../src/index';

// Mocks
jest.mock('../../src/middleware/auth.middleware', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { userId: 'u-1', githubAccessToken: 'enc-token' };
    req.contextStore = { userId: 'u-1' };
    next();
  },
  auth: (req: any, res: any, next: any) => {
    req.user = { userId: 'u-1', githubAccessToken: 'enc-token' };
    next();
  }
}));

jest.mock('../../src/db', () => ({
  __esModule: true,
  default: {
    userApiKey: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn().mockResolvedValue({ key: 'new-key' }), deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
    dailyStats: { findMany: jest.fn().mockResolvedValue([{ totalGenerations: 5 }]) },
    profileReadme: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }), findMany: jest.fn().mockResolvedValue([]), updateMany: jest.fn().mockResolvedValue({ count: 1 }), aggregate: jest.fn().mockResolvedValue({ _count: 4, _sum: { wordCount: 500 } }) },
    user: { findUnique: jest.fn().mockResolvedValue({ id: 'u-1', preferences: {} }), update: jest.fn().mockResolvedValue({}), delete: jest.fn().mockResolvedValue({}) },
    userNotification: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), updateMany: jest.fn().mockResolvedValue({ count: 0 }), update: jest.fn().mockResolvedValue({}) },
    generation: { findMany: jest.fn().mockResolvedValue([]), deleteMany: jest.fn().mockResolvedValue({ count: 1 }), aggregate: jest.fn().mockResolvedValue({ _count: 1, _sum: { wordCount: 1 } }) },
    changelog: { findMany: jest.fn().mockResolvedValue([]), updateMany: jest.fn().mockResolvedValue({ count: 1 }), aggregate: jest.fn().mockResolvedValue({ _count: 1, _sum: { wordCount: 1 } }) },
    chatSession: { findMany: jest.fn().mockResolvedValue([]), deleteMany: jest.fn().mockResolvedValue({ count: 1 }), count: jest.fn().mockResolvedValue(0) },
    healthScore: { findMany: jest.fn().mockResolvedValue([]), deleteMany: jest.fn().mockResolvedValue({ count: 1 }), updateMany: jest.fn().mockResolvedValue({ count: 1 }), count: jest.fn().mockResolvedValue(0) },
    userProfile: { update: jest.fn().mockResolvedValue({}), upsert: jest.fn().mockResolvedValue({}) },
    repository: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
    announcement: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
    chatAnalytics: { aggregate: jest.fn().mockResolvedValue({ _sum: { totalTokens: 100 } }) },
    $transaction: jest.fn().mockImplementation(async (cb) => {
      if (Array.isArray(cb)) return Promise.all(cb);
      return cb({});
    }),
    $queryRaw: jest.fn().mockResolvedValue([{}]),
    $executeRawUnsafe: jest.fn().mockResolvedValue({}),
  }
}));

jest.mock('../../src/services/github.service', () => ({
  GithubService: jest.fn().mockImplementation(() => ({
    fetchUserRepos: jest.fn().mockResolvedValue([])
  }))
}));

jest.mock('../../src/services/apiKey.service', () => ({
  APIKeyService: jest.fn().mockImplementation(() => ({
    addKey: jest.fn().mockResolvedValue({
      id: 'k-1',
      provider: 'GEMINI',
      label: 'CI/CD Key',
      lastFour: 'test',
      isVerified: true
    })
  }))
}));

jest.mock('../../src/utils/encryption', () => ({
  decrypt: jest.fn().mockReturnValue('dummy')
}));

describe('User Routes Integration', () => {
  describe('GET /api/user/apikeys', () => {
    it('should fetch keys for authenticated user via supertest', async () => {
      const res = await request(app).get('/api/user/apikeys');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('POST /api/user/apikey', () => {
    it('should invoke create logic and return new key', async () => {
      const res = await request(app).post('/api/user/apikey').send({ key: 'sk-test-key', provider: 'GEMINI', label: 'CI/CD Key' });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/user/usage', () => {
    it('should return aggregated usage stats for charting', async () => {
      const res = await request(app).get('/api/user/usage');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/user/data', () => {
    it('should wipe scoped DB keys and return 200', async () => {
      const res = await request(app).delete('/api/user/data');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/user/repos', () => {
    it('should fetch user repositories from github', async () => {
      const res = await request(app).get('/api/user/repos');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Profile and Preferences', () => {
    it('should get profile', async () => {
      const res = await request(app).get('/api/user/profile');
      expect(res.status).toBe(200);
    });

    it('should update profile', async () => {
      const res = await request(app).put('/api/user/profile').send({ bio: 'I code.' });
      expect(res.status).toBe(200);
    });

    it('should get preferences', async () => {
      const res = await request(app).get('/api/user/preferences');
      expect(res.status).toBe(200);
    });
  });

  describe('Data Export', () => {
    it('should export all user data', async () => {
      const res = await request(app).get('/api/user/export');
      expect(res.status).toBe(200);
    });
  });

  describe('Notifications', () => {
    it('should get notifications list', async () => {
      const res = await request(app).get('/api/user/notifications');
      expect(res.status).toBe(200);
    });
    
    it('should get unread count', async () => {
      const res = await request(app).get('/api/user/notifications/unread-count');
      expect(res.status).toBe(200);
    });

    it('should mark all as read', async () => {
      const res = await request(app).post('/api/user/notifications/read-all');
      expect(res.status).toBe(200);
    });
  });
});
