import app from '../../src/index';

// Mocks
vi.mock('../../src/middleware/auth.middleware', () => ({
  requireAuth: async (c: any, next: any) => {
    c.set('user', { userId: 'u-1', githubAccessToken: 'enc-token' });
    c.set('contextStore', { userId: 'u-1' });
    await next();
  },
  auth: async (c: any, next: any) => {
    c.set('user', { userId: 'u-1', githubAccessToken: 'enc-token' });
    await next();
  }
}));

vi.mock('../../src/db', () => {
  const dbMock = {
    userApiKey: { findMany: vi.fn().mockResolvedValue([]), create: vi.fn().mockResolvedValue({ key: 'new-key' }), deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
    dailyStats: { findMany: vi.fn().mockResolvedValue([{ totalGenerations: 5 }]) },
    profileReadme: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }), findMany: vi.fn().mockResolvedValue([]), updateMany: vi.fn().mockResolvedValue({ count: 1 }), aggregate: vi.fn().mockResolvedValue({ _count: 4, _sum: { wordCount: 500 } }) },
    user: { findUnique: vi.fn().mockResolvedValue({ id: 'u-1', profile: { name: 'John' }, preferences: {} }), update: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue({}) },
    userNotification: { findMany: vi.fn().mockResolvedValue([]), count: vi.fn().mockResolvedValue(0), updateMany: vi.fn().mockResolvedValue({ count: 0 }), update: vi.fn().mockResolvedValue({}) },
    generation: { findMany: vi.fn().mockResolvedValue([]), deleteMany: vi.fn().mockResolvedValue({ count: 1 }), aggregate: vi.fn().mockResolvedValue({ _count: 1, _sum: { wordCount: 1 } }) },
    changelog: { findMany: vi.fn().mockResolvedValue([]), updateMany: vi.fn().mockResolvedValue({ count: 1 }), aggregate: vi.fn().mockResolvedValue({ _count: 1, _sum: { wordCount: 1 } }) },
    chatSession: { findMany: vi.fn().mockResolvedValue([]), deleteMany: vi.fn().mockResolvedValue({ count: 1 }), count: vi.fn().mockResolvedValue(0) },
    healthScore: { findMany: vi.fn().mockResolvedValue([]), deleteMany: vi.fn().mockResolvedValue({ count: 1 }), updateMany: vi.fn().mockResolvedValue({ count: 1 }), count: vi.fn().mockResolvedValue(0) },
    userProfile: { update: vi.fn().mockResolvedValue({}), upsert: vi.fn().mockResolvedValue({}) },
    repository: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
    announcement: { findMany: vi.fn().mockResolvedValue([]), count: vi.fn().mockResolvedValue(0) },
    chatAnalytics: { aggregate: vi.fn().mockResolvedValue({ _sum: { totalTokens: 100 } }) },
    $transaction: vi.fn().mockImplementation(async (cb) => {
      if (Array.isArray(cb)) return Promise.all(cb);
      return cb({});
    }),
    $queryRaw: vi.fn().mockResolvedValue([{}]),
    $executeRawUnsafe: vi.fn().mockResolvedValue({}),
  };
  return {
    __esModule: true,
    default: dbMock,
    getPrisma: vi.fn().mockReturnValue(dbMock)
  };
});

vi.mock('../../src/services/github.service', () => ({
  GithubService: vi.fn().mockImplementation(function() { return {
    fetchUserRepos: vi.fn().mockResolvedValue([])
  }; })
}));

vi.mock('../../src/services/apiKey.service', () => ({
  APIKeyService: vi.fn().mockImplementation(function() { return {
    addKey: vi.fn().mockResolvedValue({
      id: 'k-1',
      provider: 'GEMINI',
      label: 'CI/CD Key',
      lastFour: 'test',
      isVerified: true
    })
  }; })
}));

vi.mock('../../src/utils/encryption', () => ({
  decrypt: vi.fn().mockReturnValue('dummy')
}));

describe('User Routes Integration', () => {
  describe('GET /api/user/apikeys', () => {
    it('should fetch keys for authenticated user via supertest', async () => {
      const res = await app.request('/api/user/apikeys');
      const body = await res.json() as any;
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });
  });

  describe('POST /api/user/apikey', () => {
    it('should invoke create logic and return new key', async () => {
      const res = await app.request('/api/user/apikey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'sk-test-key', provider: 'GEMINI', label: 'CI/CD Key' })
      });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/user/usage', () => {
    it('should return aggregated usage stats for charting', async () => {
      const res = await app.request('/api/user/usage');
      const body = await res.json() as any;
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
    });
  });

  describe('DELETE /api/user/data', () => {
    it('should wipe scoped DB keys and return 200', async () => {
      const res = await app.request('/api/user/data', { method: 'DELETE' });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/user/repos', () => {
    it('should fetch user repositories from github', async () => {
      const res = await app.request('/api/user/repos');
      const body = await res.json() as any;
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
    });
  });

  describe('Profile and Preferences', () => {
    it('should get profile', async () => {
      const res = await app.request('/api/user/profile');
      const text = await res.text();
      console.log('DEBUG USER BODY 2:', text);
      expect(res.status).toBe(200);
      const body = JSON.parse(text) as any;
      expect(body.data.name).toBe('John');
    });

    it('should update profile', async () => {
      const res = await app.request('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: 'I code.' })
      });
      expect(res.status).toBe(200);
    });

    it('should get preferences', async () => {
      const res = await app.request('/api/user/preferences');
      expect(res.status).toBe(200);
    });
  });

  describe('Data Export', () => {
    it('should export all user data', async () => {
      const res = await app.request('/api/user/export');
      expect(res.status).toBe(200);
    });
  });

  describe('Notifications', () => {
    it('should get notifications list', async () => {
      const res = await app.request('/api/user/notifications');
      expect(res.status).toBe(200);
    });
    
    it('should get unread count', async () => {
      const res = await app.request('/api/user/notifications/unread-count');
      expect(res.status).toBe(200);
    });

    it('should mark all as read', async () => {
      const res = await app.request('/api/user/notifications/read-all', { method: 'POST' });
      expect(res.status).toBe(200);
    });
  });
});
