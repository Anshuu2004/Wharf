process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.GITHUB_CLIENT_ID = 'cid';

import app from '../../src/index';
import { RepoService } from '../../src/services/repo.service';

vi.mock('../../src/middleware/auth.middleware', () => ({
  requireAuth: async (c: any, next: any) => {
    c.set('user', { userId: 'u-1', githubAccessToken: 'enc-token', installationId: 'inst-1' });
    await next();
  },
  auth: async (c: any, next: any) => {
    c.set('user', { userId: 'u-1', githubAccessToken: 'enc-token', installationId: 'inst-1' });
    await next();
  }
}));

vi.mock('../../src/utils/encryption', () => ({
  decrypt: vi.fn().mockReturnValue('dec-token')
}));

vi.mock('../../src/services/repo.service', () => ({
  RepoService: vi.fn().mockImplementation(function() { return {
    analyzeRepo: vi.fn().mockResolvedValue({
      score: 100,
      details: []
    }),
    getRepoFiles: vi.fn().mockResolvedValue({ "README.md": "Hello" })
  }; })
}));

vi.mock('../../src/db', () => {
  const dbMock = {
    repository: {
      findUnique: vi.fn().mockResolvedValue({ id: 'r-1', name: 'Wait' })
    },
    $executeRaw: vi.fn().mockResolvedValue(0)
  };
  return {
    __esModule: true,
    default: dbMock,
    getPrisma: vi.fn().mockReturnValue(dbMock)
  };
});

describe('Repo Routes Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/repo/analyze', () => {
    it('should validate inputs and return 200 with JSON payload', async () => {
      const response = await app.request('/api/repo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: 'https://github.com/foo/bar' })
      });

      expect(response.status).toBe(200);
      const body = await response.text();
      console.log("DEBUG BODY:", body);
      const data = JSON.parse(body);
      expect(data).toEqual({
        success: true,
        data: { score: 100, details: [] }
      });
    });

    it('should block bad repo URLs', async () => {
      (RepoService as any).mockImplementationOnce(function() { return {
        analyzeRepo: vi.fn().mockRejectedValue(Object.assign(new Error('Invalid GitHub repository URL'), { status: 400 }))
      }; });

      const response = await app.request('/api/repo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: 'not-a-repo' })
      });

      expect(response.status).toBe(400);
      const body = await response.json() as any;
      expect(body.success).toBe(false);
    });
  });

  describe('GET /api/repo/:id', () => {
    it('should return a repo by id successfully', async () => {
      const response = await app.request('/api/repo/r-1');
      expect(response.status).toBe(200);
      const body = await response.json() as any;
      expect(body.name).toBe('Wait');
    });
  });
});
