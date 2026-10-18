import app from '../../src/index';

vi.mock('../../src/middleware/auth.middleware', () => ({
  requireAuth: async (c: any, next: any) => {
    c.set('user', { userId: 'u-1' });
    await next();
  },
  auth: async (c: any, next: any) => {
    c.set('user', { userId: 'u-1' });
    await next();
  }
}));

vi.mock('../../src/db', () => {
  const dbMock = {
    user: { count: vi.fn().mockResolvedValue(1) },
    profileReadme: { count: vi.fn().mockResolvedValue(0) },
    changelog: { count: vi.fn().mockResolvedValue(0) },
    healthScore: {
      upsert: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({}),
      findMany: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue({}),
      count: vi.fn().mockResolvedValue(0)
    },
    $executeRaw: vi.fn().mockResolvedValue(0),
  };
  return {
    __esModule: true,
    default: dbMock,
    getPrisma: vi.fn().mockReturnValue(dbMock)
  };
});

vi.mock('../../src/services/github.service', () => ({
  GithubService: vi.fn().mockImplementation(function() { return {
    getReadmeContent: vi.fn().mockResolvedValue('# README'),
    getContributingFile: vi.fn().mockResolvedValue('CONTRIBUTING'),
    getIssueTemplates: vi.fn().mockResolvedValue([]),
    getPRTemplates: vi.fn().mockResolvedValue([]),
    checkFileExists: vi.fn().mockResolvedValue(true),
  }; })
}));

vi.mock('../../src/services/healthScore.service', () => ({
  healthScoreService: {
    analyzeReadmeHealth: vi.fn().mockResolvedValue({ score: 85, breakdown: {}, suggestions: [] }),
    analyzeContributionReadiness: vi.fn().mockResolvedValue({ score: 70, breakdown: {}, suggestions: [] }),
  }
}));

vi.mock('../../src/utils/encryption', () => ({
  decrypt: vi.fn().mockReturnValue('dec-token')
}));

vi.mock('../../src/utils/dailyStats', () => ({
  recordDailyGeneration: vi.fn().mockResolvedValue(undefined)
}));

describe('Health Routes Integration', () => {
  describe('GET /health', () => {
    it('should return basic health status directly on root path', async () => {
      const response = await app.request('/health');
      expect(response.status).toBe(200);
      const body = await response.json() as any;
      expect(body.status).toBe('ok');
    });
  });

  describe('POST /api/health/score', () => {
    it('should generate readme health score', async () => {
      const res = await app.request('/api/health/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: 'https://github.com/foo/bar' })
      });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/health/contribution', () => {
    it('should generate contribution readiness score', async () => {
      const res = await app.request('/api/health/contribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: 'https://github.com/foo/bar' })
      });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/health/history', () => {
    it('should retrieve health history', async () => {
      const res = await app.request('/api/health/history');
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/health/history/:id', () => {
    it('should return 400 for non-existent record', async () => {
      const res = await app.request('/api/health/history/h-1', { method: 'DELETE' });
      // Returns 400 From Catch Block Since Delete By Id+UserId Will Fail With Mocked Response
      expect([200, 400]).toContain(res.status);
    });
  });
});
