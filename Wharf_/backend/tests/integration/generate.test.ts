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
    generation: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue({ id: 'g-1', repository: { userId: 'u-1', owner: 'foo', name: 'bar', url: 'https://github.com/foo/bar', language: 'TS', stars: 0 } }),
      count: vi.fn().mockResolvedValue(1),
      delete: vi.fn().mockResolvedValue({ id: 'g-1' }),
      create: vi.fn().mockResolvedValue({ id: 'g-1' })
    },
    repository: {
      upsert: vi.fn().mockResolvedValue({ id: 'r-1' }),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({ githubAccessToken: 'enc', installationId: null }),
    },
    $executeRaw: vi.fn().mockResolvedValue(0),
    $executeRawUnsafe: vi.fn().mockResolvedValue(0),
  };
  return {
    __esModule: true,
    default: dbMock,
    getPrisma: vi.fn().mockReturnValue(dbMock)
  };
});

vi.mock('../../src/services/repo.service', () => ({
  RepoService: vi.fn().mockImplementation(function() { return {
    analyzeRepo: vi.fn().mockResolvedValue({
      meta: { description: '', stars: 0, language: 'TS' },
      files: [],
      readme: ''
    })
  }; })
}));

vi.mock('../../src/services/ai.service', () => ({
  aiService: {
    generateReadmeStream: vi.fn().mockImplementation(async (ctx, tone, sections, userId, cb) => {
      cb('hello world');
      return { text: 'hello world', provider: 'GEMINI' };
    })
  }
}));

vi.mock('../../src/services/cache.service', () => ({
  cacheService: {
    getReadme: vi.fn().mockResolvedValue(null),
    setReadme: vi.fn().mockResolvedValue(undefined),
  }
}));

vi.mock('../../src/utils/encryption', () => ({
  decrypt: vi.fn().mockReturnValue('dec-token')
}));

vi.mock('../../src/utils/dailyStats', () => ({
  recordDailyGeneration: vi.fn().mockResolvedValue(undefined)
}));

describe('Generate Routes Integration', () => {
  describe('POST /api/generate/readme', () => {
    it('should initiate readme generation', async () => {
      const res = await app.request('/api/generate/readme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: 'https://github.com/foo/bar', tone: 'professional', sections: ['Installation', 'Usage'] })
      });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/generate/history', () => {
    it('should retrieve generation history list', async () => {
      const res = await app.request('/api/generate/history');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/generate/history/:id', () => {
    it('should retrieve a specific generation history item', async () => {
      const res = await app.request('/api/generate/history/g-1');
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/generate/history/:id', () => {
    it('should delete a history item', async () => {
      const res = await app.request('/api/generate/history/g-1', { method: 'DELETE' });
      expect(res.status).toBe(200);
    });
  });
});
