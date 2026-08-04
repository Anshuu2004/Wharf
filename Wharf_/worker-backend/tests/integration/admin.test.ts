import app from '../../src/index';

// Set Admin User ID So The In-Route adminAuth Middleware Passes
process.env.ADMIN_IDS = 'admin-1';

vi.mock('../../src/services/cache.service', () => ({
  cacheService: {
    getDbStats: vi.fn().mockResolvedValue(null),
    setDbStats: vi.fn()
  }
}));

vi.mock('../../src/utils/redis', () => ({
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(undefined),
  getCacheStats: vi.fn().mockReturnValue({ hitRate: 99, missRate: 1, size: 0 }),
  closeRedisClient: vi.fn().mockResolvedValue(undefined),
  checkRedisStatus: vi.fn().mockReturnValue(false),
}));

vi.mock('../../src/middleware/auth.middleware', () => ({
  requireAuth: async (c: any, next: any) => {
    c.set('user', { userId: 'admin-1', role: 'ADMIN' });
    await next();
  },
  auth: async (c: any, next: any) => {
    c.set('user', { userId: 'admin-1', role: 'ADMIN' });
    await next();
  }
}));

const fixedDate = new Date('2026-01-01T00:00:00.000Z');

vi.mock('../../src/db', () => {
  const dbMock = {
    chatSession: { count: vi.fn().mockResolvedValue(10), findMany: vi.fn().mockResolvedValue([]) },
    generation: {
      aggregate: vi.fn().mockResolvedValue({ _count: 4, _sum: { wordCount: 500 } }),
      count: vi.fn().mockResolvedValue(5),
      findMany: vi.fn().mockResolvedValue([])
    },
    profileReadme: {
      count: vi.fn().mockResolvedValue(3),
      findMany: vi.fn().mockResolvedValue([]),
      aggregate: vi.fn().mockResolvedValue({ _count: 3, _sum: { wordCount: 400 } })
    },
    healthScore: {
      count: vi.fn().mockResolvedValue(2),
      findMany: vi.fn().mockResolvedValue([]),
      aggregate: vi.fn().mockResolvedValue({ _count: 2 })
    },
    changelog: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
      aggregate: vi.fn().mockResolvedValue({ _count: 1, _sum: { wordCount: 200 } })
    },
    user: { count: vi.fn().mockResolvedValue(10) },
    repository: { findMany: vi.fn().mockResolvedValue([]) },
    chatAnalytics: { findMany: vi.fn().mockResolvedValue([]) },
    analytics: { aggregate: vi.fn().mockResolvedValue({ _avg: { responseTime: 2300 } }) },
    userApiKey: { groupBy: vi.fn().mockResolvedValue([]) },
    systemKey: { groupBy: vi.fn().mockResolvedValue([]) },
    announcement: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 'a-1' }),
      update: vi.fn().mockResolvedValue({ id: 'a-1' }),
      delete: vi.fn().mockResolvedValue({})
    },
    $queryRaw: vi.fn().mockResolvedValue([{
      totalTokens: 100n,
      totalReadmes: 5n,
      totalProfiles: 2n,
      totalHealthChecks: 1n,
      totalChangelogs: 1n,
      totalChats: 1n,
      date: new Date('2026-01-01T00:00:00.000Z'),
      totalGenerations: 2,
      activeUsers: 1,
    }]),
    $executeRaw: vi.fn().mockResolvedValue(0),
  };
  return {
    __esModule: true,
    default: dbMock,
    getPrisma: vi.fn().mockReturnValue(dbMock)
  };
});

describe('Admin Routes Integration', () => {
  describe('GET /api/admin/dashboard', () => {
    it('should aggregate complex queries and return HTTP 200 payload', async () => {
      const res = await app.request('/api/admin/dashboard');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/admin/public-stats', () => {
    it('should return public usage statistics', async () => {
      const res = await app.request('/api/admin/public-stats');
      expect(res.status).toBe(200);
    });
  });

  describe('Admin Announcements', () => {
    it('GET /api/admin/announcements should list announcements', async () => {
      const res = await app.request('/api/admin/announcements');
      expect(res.status).toBe(200);
    });

    it('POST /api/admin/announcements should create an announcement', async () => {
      const res = await app.request('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Update', content: 'Here it is' })
      });
      expect(res.status).toBe(201);
    });

    it('PUT /api/admin/announcements/:id should update an announcement', async () => {
      const res = await app.request('/api/admin/announcements/a-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' })
      });
      expect(res.status).toBe(200);
    });

    it('PATCH /api/admin/announcements/:id/publish should toggle publish status', async () => {
      const res = await app.request('/api/admin/announcements/a-1/publish', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: true })
      });
      expect(res.status).toBe(200);
    });

    it('DELETE /api/admin/announcements/:id should delete an announcement', async () => {
      const res = await app.request('/api/admin/announcements/a-1', { method: 'DELETE' });
      expect([200, 204]).toContain(res.status);
    });
  });
});
