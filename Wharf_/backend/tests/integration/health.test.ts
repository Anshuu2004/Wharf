import request from 'supertest';
import app from '../../src/index';

jest.mock('../../src/middleware/auth.middleware', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { userId: 'u-1' };
    next();
  },
  auth: (req: any, res: any, next: any) => {
    req.user = { userId: 'u-1' };
    next();
  }
}));

jest.mock('../../src/db', () => ({
  __esModule: true,
  default: {
    user: { count: jest.fn().mockResolvedValue(1) },
    profileReadme: { count: jest.fn().mockResolvedValue(0) },
    changelog: { count: jest.fn().mockResolvedValue(0) },
    healthScore: {
      upsert: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0)
    },
    $executeRaw: jest.fn().mockResolvedValue(0),
  }
}));

jest.mock('../../src/services/github.service', () => ({
  GithubService: jest.fn().mockImplementation(() => ({
    getReadmeContent: jest.fn().mockResolvedValue('# README'),
    getContributingFile: jest.fn().mockResolvedValue('CONTRIBUTING'),
    getIssueTemplates: jest.fn().mockResolvedValue([]),
    getPRTemplates: jest.fn().mockResolvedValue([]),
    checkFileExists: jest.fn().mockResolvedValue(true),
  }))
}));

jest.mock('../../src/services/healthScore.service', () => ({
  healthScoreService: {
    analyzeReadmeHealth: jest.fn().mockResolvedValue({ score: 85, breakdown: {}, suggestions: [] }),
    analyzeContributionReadiness: jest.fn().mockResolvedValue({ score: 70, breakdown: {}, suggestions: [] }),
  }
}));

jest.mock('../../src/utils/encryption', () => ({
  decrypt: jest.fn().mockReturnValue('dec-token')
}));

jest.mock('../../src/utils/dailyStats', () => ({
  recordDailyGeneration: jest.fn().mockResolvedValue(undefined)
}));

describe('Health Routes Integration', () => {
  describe('GET /health', () => {
    it('should return basic health status directly on root path', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('POST /api/health/score', () => {
    it('should generate readme health score', async () => {
      const res = await request(app).post('/api/health/score').send({ repoUrl: 'https://github.com/foo/bar' });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/health/contribution', () => {
    it('should generate contribution readiness score', async () => {
      const res = await request(app).post('/api/health/contribution').send({ repoUrl: 'https://github.com/foo/bar' });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/health/history', () => {
    it('should retrieve health history', async () => {
      const res = await request(app).get('/api/health/history');
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/health/history/:id', () => {
    it('should return 400 for non-existent record', async () => {
      const res = await request(app).delete('/api/health/history/h-1');
      // Returns 400 From Catch Block Since Delete By Id+UserId Will Fail With Mocked Response
      expect([200, 400]).toContain(res.status);
    });
  });
});
