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
    generation: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({ id: 'g-1', repository: { userId: 'u-1', owner: 'foo', name: 'bar', url: 'https://github.com/foo/bar', language: 'TS', stars: 0 } }),
      count: jest.fn().mockResolvedValue(1),
      delete: jest.fn().mockResolvedValue({ id: 'g-1' }),
      create: jest.fn().mockResolvedValue({ id: 'g-1' })
    },
    repository: {
      upsert: jest.fn().mockResolvedValue({ id: 'r-1' }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({ githubAccessToken: 'enc', installationId: null }),
    },
    $executeRaw: jest.fn().mockResolvedValue(0),
    $executeRawUnsafe: jest.fn().mockResolvedValue(0),
  }
}));

jest.mock('../../src/services/repo.service', () => ({
  RepoService: jest.fn().mockImplementation(() => ({
    analyzeRepo: jest.fn().mockResolvedValue({
      meta: { description: '', stars: 0, language: 'TS' },
      files: [],
      readme: ''
    })
  }))
}));

jest.mock('../../src/services/ai.service', () => ({
  aiService: {
    generateReadmeStream: jest.fn().mockImplementation(async (ctx, tone, sections, userId, cb) => {
      cb('hello world');
      return { text: 'hello world', provider: 'GEMINI' };
    })
  }
}));

jest.mock('../../src/services/cache.service', () => ({
  cacheService: {
    getReadme: jest.fn().mockResolvedValue(null),
    setReadme: jest.fn().mockResolvedValue(undefined),
  }
}));

jest.mock('../../src/utils/encryption', () => ({
  decrypt: jest.fn().mockReturnValue('dec-token')
}));

jest.mock('../../src/utils/dailyStats', () => ({
  recordDailyGeneration: jest.fn().mockResolvedValue(undefined)
}));

describe('Generate Routes Integration', () => {
  describe('POST /api/generate/readme', () => {
    it('should initiate readme generation', async () => {
      const res = await request(app)
        .post('/api/generate/readme')
        .send({ repoUrl: 'https://github.com/foo/bar', tone: 'professional', sections: ['Installation', 'Usage'] });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/generate/history', () => {
    it('should retrieve generation history list', async () => {
      const res = await request(app).get('/api/generate/history');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/generate/history/:id', () => {
    it('should retrieve a specific generation history item', async () => {
      const res = await request(app).get('/api/generate/history/g-1');
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/generate/history/:id', () => {
    it('should delete a history item', async () => {
      const res = await request(app).delete('/api/generate/history/g-1');
      expect(res.status).toBe(200);
    });
  });
});
