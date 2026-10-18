import request from 'supertest';
import app from '../../src/index';

jest.mock('../../src/middleware/auth.middleware', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { userId: 'u-1', githubAccessToken: 'enc-token' };
    next();
  },
  auth: (req: any, res: any, next: any) => {
    req.user = { userId: 'u-1', githubAccessToken: 'enc-token' };
    next();
  }
}));

jest.mock('../../src/services/changelog.service', () => ({
  ChangelogService: jest.fn().mockImplementation(() => ({
    getCommitStats: jest.fn().mockResolvedValue({ totalCommits: 5 }),
    generateChangelog: jest.fn().mockResolvedValue({
      stream: (async function*() { yield 'mockchunk'; })(),
      provider: 'GEMINI'
    }),
    getHistory: jest.fn().mockResolvedValue([]),
    deleteChangelog: jest.fn().mockResolvedValue(undefined)
  }))
}));

jest.mock('../../src/services/github.service', () => ({
  GithubService: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('../../src/services/cache.service', () => ({
  cacheService: {
    getChangelog: jest.fn().mockResolvedValue(null),
    setChangelog: jest.fn().mockResolvedValue(undefined),
  }
}));

jest.mock('../../src/utils/encryption', () => ({
  decrypt: jest.fn().mockReturnValue('dec-token')
}));

jest.mock('../../src/db', () => ({
  __esModule: true,
  default: {
    changelog: {
      create: jest.fn().mockResolvedValue({ id: 'cl-1' }),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({ id: 'cl-1', userId: 'u-1' }),
      delete: jest.fn().mockResolvedValue({}),
    },
    $executeRaw: jest.fn().mockResolvedValue(0),
  }
}));

jest.mock('../../src/utils/dailyStats', () => ({
  recordDailyGeneration: jest.fn().mockResolvedValue(undefined)
}));

describe('Changelog Routes Integration', () => {
  describe('POST /api/changelog/stats', () => {
    it('should calculate stats successfully', async () => {
      const res = await request(app).post('/api/changelog/stats').send({ repoUrl: 'https://github.com/foo/bar' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/changelog/history', () => {
    it('should retrieve historical changelog gens', async () => {
      const res = await request(app).get('/api/changelog/history');
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/changelog/generate', () => {
    it('should initiate changelog generation', async () => {
      const res = await request(app)
        .post('/api/changelog/generate')
        .send({ repoUrl: 'https://github.com/foo/bar' });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/changelog/:id', () => {
    it('should delete changelog item', async () => {
      const res = await request(app).delete('/api/changelog/c-1');
      expect(res.status).toBe(200);
    });
  });
});
