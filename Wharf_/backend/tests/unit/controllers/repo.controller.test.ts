import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import type { Mock } from "vitest";
import { analyzeRepo } from '../../../src/controllers/repo.controller';
import { RepoService } from '../../../src/services/repo.service';
import { decrypt } from '../../../src/utils/encryption';
import { createMockContext } from '../test-utils';

vi.mock('../../../src/services/repo.service');
vi.mock('../../../src/utils/encryption');
vi.mock('../../../src/db', () => ({
  __esModule: true,
  default: {},
  getPrisma: vi.fn().mockReturnValue({
    user: { findUnique: vi.fn() },
  })
}));

describe('RepoController', () => {
  let mockEnv: any;
  let prismaObj: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockEnv = { ENCRYPTION_SECRET: 'secret', DATABASE_URL: 'post://' };
    prismaObj = (await import('../../../src/db')).getPrisma('');
  });

  describe('analyzeRepo', () => {
    it('should return 400 if repoUrl is missing', async () => {
      const c = createMockContext({ body: {} }, mockEnv);
      const res = await analyzeRepo(c);

      expect(c.json).toHaveBeenCalledWith({ success: false, error: 'Repository URL is required' }, 400);
    });

    it('should inject DB user tokens and return 200 on successful analysis', async () => {
      const c = createMockContext({ body: { repoUrl: 'https://github.com/a/b' } }, mockEnv, { userId: 'u-1' });

      (prismaObj.user.findUnique as Mock).mockResolvedValue({
        githubAccessToken: 'encrypted-token',
        installationId: 'inst-id'
      });
      (decrypt as Mock).mockReturnValue('clear-token');

      const mockAnalysisResult = { meta: { name: 'b' } };
      (RepoService.prototype.analyzeRepo as Mock).mockResolvedValue(mockAnalysisResult);

      await analyzeRepo(c);

      expect(prismaObj.user.findUnique).toHaveBeenCalledWith({ where: { id: 'u-1' }, select: { githubAccessToken: true, installationId: true } });
      expect(decrypt).toHaveBeenCalledWith('encrypted-token', 'secret');
      expect(RepoService).toHaveBeenCalledWith({ token: 'clear-token', installationId: 'inst-id' });

      expect(c.json).toHaveBeenCalledWith({
        success: true,
        data: mockAnalysisResult
      });
    });

    it('should handle service errors normally', async () => {
      const c = createMockContext({ body: { repoUrl: 'https://github.com/a/b' } }, mockEnv);
      const err = new Error('Not found') as any;
      err.status = 404;
      (RepoService.prototype.analyzeRepo as Mock).mockRejectedValue(err);

      await analyzeRepo(c);
      expect(c.json).toHaveBeenCalledWith({ success: false, error: 'Not found' }, 404);
    });
  });
});
