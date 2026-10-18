import request from 'supertest';
import app from '../../src/index';

// Set Admin User ID So The In-Route adminAuth Middleware Passes
process.env.ADMIN_IDS = 'admin-1';

jest.mock('../../src/services/cache.service', () => ({
  cacheService: {
    getDbStats: jest.fn().mockResolvedValue(null),
    setDbStats: jest.fn()
  }
}));

jest.mock('../../src/utils/redis', () => ({
  cacheGet: jest.fn().mockResolvedValue(null),
  cacheSet: jest.fn().mockResolvedValue(undefined),
  getCacheStats: jest.fn().mockReturnValue({ hitRate: 99, missRate: 1, size: 0 }),
  closeRedisClient: jest.fn().mockResolvedValue(undefined),
  checkRedisStatus: jest.fn().mockReturnValue(false),
}));

jest.mock('../../src/middleware/auth.middleware', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { userId: 'admin-1', role: 'ADMIN' };
    next();
  },
  auth: (req: any, res: any, next: any) => {
    req.user = { userId: 'admin-1', role: 'ADMIN' };
    next();
  }
}));

const fixedDate = new Date('2026-01-01T00:00:00.000Z');

jest.mock('../../src/db', () => ({
  __esModule: true,
  default: {
    chatSession: { count: jest.fn().mockResolvedValue(10), findMany: jest.fn().mockResolvedValue([]) },
    generation: {
      aggregate: jest.fn().mockResolvedValue({ _count: 4, _sum: { wordCount: 500 } }),
      count: jest.fn().mockResolvedValue(5),
      findMany: jest.fn().mockResolvedValue([])
    },
    profileReadme: {
      count: jest.fn().mockResolvedValue(3),
      findMany: jest.fn().mockResolvedValue([]),
      aggregate: jest.fn().mockResolvedValue({ _count: 3, _sum: { wordCount: 400 } })
    },
    healthScore: {
      count: jest.fn().mockResolvedValue(2),
      findMany: jest.fn().mockResolvedValue([]),
      aggregate: jest.fn().mockResolvedValue({ _count: 2 })
    },
    changelog: {
      count: jest.fn().mockResolvedValue(1),
      findMany: jest.fn().mockResolvedValue([]),
      aggregate: jest.fn().mockResolvedValue({ _count: 1, _sum: { wordCount: 200 } })
    },
    user: { count: jest.fn().mockResolvedValue(10) },
    repository: { findMany: jest.fn().mockResolvedValue([]) },
    chatAnalytics: { findMany: jest.fn().mockResolvedValue([]) },
    analytics: { aggregate: jest.fn().mockResolvedValue({ _avg: { responseTime: 2300 } }) },
    userApiKey: { groupBy: jest.fn().mockResolvedValue([]) },
    systemKey: { groupBy: jest.fn().mockResolvedValue([]) },
    announcement: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: 'a-1' }),
      update: jest.fn().mockResolvedValue({ id: 'a-1' }),
      delete: jest.fn().mockResolvedValue({})
    },
    $queryRaw: jest.fn().mockResolvedValue([{
      totalTokens: 100n,
      totalReadmes: 5n,
      totalProfiles: 2n,
      totalHealthChecks: 1n,
      totalChangelogs: 1n,
      totalChats: 1n,
      // Fields For Heatmap/UsageData Queries — They Check r.date.toISOString() / r.date.getMonth()
      date: new Date('2026-01-01T00:00:00.000Z'),
      totalGenerations: 2,
      activeUsers: 1,
    }]),
    $executeRaw: jest.fn().mockResolvedValue(0),
  }
}));

describe('Admin Routes Integration', () => {
  describe('GET /api/admin/dashboard', () => {
    it('should aggregate complex queries and return HTTP 200 payload', async () => {
      const res = await request(app).get('/api/admin/dashboard');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/admin/public-stats', () => {
    it('should return public usage statistics', async () => {
      const res = await request(app).get('/api/admin/public-stats');
      expect(res.status).toBe(200);
    });
  });

  describe('Admin Announcements', () => {
    it('GET /api/admin/announcements should list announcements', async () => {
      const res = await request(app).get('/api/admin/announcements');
      expect(res.status).toBe(200);
    });

    it('POST /api/admin/announcements should create an announcement', async () => {
      const res = await request(app).post('/api/admin/announcements').send({ title: 'New Update', content: 'Here it is' });
      expect(res.status).toBe(201);
    });

    it('PUT /api/admin/announcements/:id should update an announcement', async () => {
      const res = await request(app).put('/api/admin/announcements/a-1').send({ title: 'Updated' });
      expect(res.status).toBe(200);
    });

    it('PATCH /api/admin/announcements/:id/publish should toggle publish status', async () => {
      const res = await request(app).patch('/api/admin/announcements/a-1/publish').send({ isPublished: true });
      expect(res.status).toBe(200);
    });

    it('DELETE /api/admin/announcements/:id should delete an announcement', async () => {
      const res = await request(app).delete('/api/admin/announcements/a-1');
      // Controller Sends 204 No Content
      expect([200, 204]).toContain(res.status);
    });
  });
});
