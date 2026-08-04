import app from '../../src/index';

vi.mock('../../src/middleware/auth.middleware', () => ({
  requireAuth: async (c: any, next: any) => {
    c.set('user', { userId: 'u-1', githubAccessToken: 'enc-token' });
    await next();
  },
  auth: async (c: any, next: any) => {
    c.set('user', { userId: 'u-1', githubAccessToken: 'enc-token' });
    await next();
  }
}));

vi.mock('../../src/services/changelog.service', () => ({
  ChangelogService: vi.fn().mockImplementation(function() { return {
    getCommitStats: vi.fn().mockResolvedValue({ totalCommits: 5 }),
    generateChangelog: vi.fn().mockResolvedValue({
      stream: (async function*() { yield 'mockchunk'; })(),
      provider: 'GEMINI'
    }),
    getHistory: vi.fn().mockResolvedValue([]),
    deleteChangelog: vi.fn().mockResolvedValue(undefined)
  }; })
}));

vi.mock('../../src/services/github.service', () => ({
  GithubService: vi.fn().mockImplementation(function() { return {}; })
}));

vi.mock('../../src/services/cache.service', () => ({
  cacheService: {
    getChangelog: vi.fn().mockResolvedValue(null),
    setChangelog: vi.fn().mockResolvedValue(undefined),
  }
}));

vi.mock('../../src/utils/encryption', () => ({
  decrypt: vi.fn().mockReturnValue('dec-token')
}));

vi.mock('../../src/db', () => {
  const dbMock = {
    changelog: {
      create: vi.fn().mockResolvedValue({ id: 'cl-1' }),
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue({ id: 'cl-1', userId: 'u-1' }),
      delete: vi.fn().mockResolvedValue({}),
    },
    $executeRaw: vi.fn().mockResolvedValue(0),
  };
  return {
    __esModule: true,
    default: dbMock,
    getPrisma: vi.fn().mockReturnValue(dbMock)
  };
});

vi.mock('../../src/utils/dailyStats', () => ({
  recordDailyGeneration: vi.fn().mockResolvedValue(undefined)
}));

describe('Changelog Routes Integration', () => {
  describe('POST /api/changelog/stats', () => {
    it('should calculate stats successfully', async () => {
      const res = await app.request('/api/changelog/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: 'https://github.com/foo/bar' })
      });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.success).toBe(true);
    });
  });

  describe('GET /api/changelog/history', () => {
    it('should retrieve historical changelog gens', async () => {
      const res = await app.request('/api/changelog/history');
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/changelog/generate', () => {
    it('should initiate changelog generation', async () => {
      const res = await app.request('/api/changelog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: 'https://github.com/foo/bar' })
      });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/changelog/history/:id', () => {
    it('should delete changelog item', async () => {
      const res = await app.request('/api/changelog/history/c-1', { method: 'DELETE' });
      expect(res.status).toBe(200);
    });
  });
});
