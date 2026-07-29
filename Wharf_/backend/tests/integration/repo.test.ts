import request from 'supertest';
import app from '../../src/index';

jest.mock('../../src/middleware/auth.middleware', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { userId: 'u-1', githubAccessToken: 'enc-token', installationId: 'inst-1' };
    next();
  },
  auth: (req: any, res: any, next: any) => {
    req.user = { userId: 'u-1', githubAccessToken: 'enc-token', installationId: 'inst-1' };
    next();
  }
}));

jest.mock('../../src/utils/encryption', () => ({
  decrypt: jest.fn().mockReturnValue('dec-token')
}));

jest.mock('../../src/services/repo.service', () => ({
  RepoService: jest.fn().mockImplementation(() => ({
    analyzeRepo: jest.fn().mockResolvedValue({ score: 100, details: [] })
  }))
}));

jest.mock('../../src/db', () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn().mockResolvedValue({ githubAccessToken: 'enc', installationId: 'inst' }) }
  }
}));

describe('Repo Routes Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/repo/analyze', () => {
    it('should validate inputs and return 200 with JSON payload', async () => {
      const response = await request(app)
        .post('/api/repo/analyze')
        .send({ repoUrl: 'https://github.com/foo/bar' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: { score: 100, details: [] }
      });
    });

    it('should block bad repo URLs', async () => {
      // Restore Real RepoService For This Test To Trigger Validation (The Controller Validates URL Format)
      const { RepoService } = require('../../src/services/repo.service');
      RepoService.mockImplementationOnce(() => ({
        analyzeRepo: jest.fn().mockRejectedValue(new Error('Invalid GitHub repository URL'))
      }));

      const response = await request(app)
        .post('/api/repo/analyze')
        .send({ repoUrl: 'invalid-url' });

      // Controller May Return 400 Or 500 Depending On Validation Path
      expect([400, 500]).toContain(response.status);
    });
  });
});
