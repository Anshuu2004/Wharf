import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import type { Mock } from "vitest";
import { HealthController } from '../../../src/controllers/health.controller';
import { healthScoreService } from '../../../src/services/healthScore.service';
import { GithubService } from '../../../src/services/github.service';
import { decrypt } from '../../../src/utils/encryption';
import { createMockContext } from '../test-utils';

vi.mock('../../../src/services/healthScore.service');
vi.mock('../../../src/services/github.service');
vi.mock('../../../src/utils/encryption');
vi.mock('../../../src/utils/dailyStats');
vi.mock('../../../src/utils/logger', () => ({
  loggerService: { error: vi.fn(), stepStart: vi.fn(), stepEnd: vi.fn() },
  saveRequestLog: vi.fn()
}));

vi.mock('../../../src/db', () => ({
  __esModule: true,
  default: {},
  getPrisma: vi.fn().mockReturnValue({
    healthScore: {
      upsert: vi.fn(),
      updateMany: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    },
    $executeRaw: vi.fn()
  })
}));

describe('HealthController', () => {
  let controller: HealthController;
  let mockEnv: any;
  let prismaObj: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    controller = new HealthController();
    mockEnv = { ENCRYPTION_SECRET: 'secret', DATABASE_URL: 'post://' };
    prismaObj = (await import('../../../src/db')).getPrisma('');
  });

  describe('analyzeReadmeHealth', () => {
    it('should return 400 if repoUrl is missing or invalid', async () => {
      const c1 = createMockContext({ body: {} }, mockEnv);
      await controller.analyzeReadmeHealth(c1);
      expect(c1.json).toHaveBeenCalledWith({ success: false, error: 'repoUrl is required' }, 400);

      const c2 = createMockContext({ body: { repoUrl: 'invalid' } }, mockEnv);
      await controller.analyzeReadmeHealth(c2);
      expect(c2.json).toHaveBeenCalledWith({ success: false, error: 'Invalid GitHub URL' }, 400);
    });

    it('should fetch readme, analyze it, save to DB, and record tokens if user is logged in', async () => {
      const c = createMockContext({ body: { repoUrl: 'https://github.com/foo/bar' } }, mockEnv, { userId: 'u-1', githubAccessToken: 'enc' });

      (decrypt as Mock).mockReturnValue('decrypted');
      (GithubService.prototype.getReadmeContent as Mock).mockResolvedValue('# hello');

      const mockResult = { score: 100, breakdown: {}, suggestions: [] };
      (healthScoreService.analyzeReadmeHealth as Mock).mockResolvedValue(mockResult);

      await controller.analyzeReadmeHealth(c);

      expect(decrypt).toHaveBeenCalledWith('enc', 'secret');
      expect(GithubService).toHaveBeenCalledWith({ token: 'decrypted' });
      expect(GithubService.prototype.getReadmeContent).toHaveBeenCalledWith('foo', 'bar');
      expect(healthScoreService.analyzeReadmeHealth).toHaveBeenCalledWith('# hello');
      expect(prismaObj.healthScore.upsert).toHaveBeenCalled();
      expect(prismaObj.$executeRaw).toHaveBeenCalled();
      
      expect(c.json).toHaveBeenCalledWith({ success: true, data: mockResult });
    });
  });

  describe('analyzeContributionReadiness', () => {
    it('should aggregate various github tests to produce contribution score', async () => {
      const c = createMockContext({ body: { repoUrl: 'https://github.com/foo/bar' } }, mockEnv);
      
      (GithubService.prototype.getContributingFile as Mock).mockResolvedValue(true);
      (GithubService.prototype.getIssueTemplates as Mock).mockResolvedValue(['t1']);
      (GithubService.prototype.getPRTemplates as Mock).mockResolvedValue([]);
      (GithubService.prototype.checkFileExists as Mock).mockResolvedValue(false);
      (GithubService.prototype.getReadmeContent as Mock).mockResolvedValue('readme');

      const mockScore = { score: 50, breakdown: {}, suggestions: [] };
      (healthScoreService.analyzeContributionReadiness as Mock).mockResolvedValue(mockScore);

      await controller.analyzeContributionReadiness(c);

      expect(healthScoreService.analyzeContributionReadiness).toHaveBeenCalledWith(
        true, 1, 0, false, 'readme', false
      );
      expect(prismaObj.healthScore.updateMany).toHaveBeenCalled();
      expect(c.json).toHaveBeenCalledWith({ success: true, data: mockScore });
    });
  });

  describe('History Methods', () => {
    it('getHistory should return paginated data', async () => {
      const c = createMockContext({ query: {} }, mockEnv, { userId: 'u-1' });
      (prismaObj.healthScore.findMany as Mock).mockResolvedValue([{ id: 'h1' }]);

      await controller.getHistory(c);

      expect(prismaObj.healthScore.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 50 }));
      expect(c.json).toHaveBeenCalledWith({ success: true, data: [{ id: 'h1' }] });
    });

    it('deleteHistory should trigger raw SQL limits and delete', async () => {
      const c = createMockContext({ params: { id: 'h1' } }, mockEnv, { userId: 'u-1' });

      await controller.deleteHistory(c);

      expect(prismaObj.$executeRaw).toHaveBeenCalled();
      expect(prismaObj.healthScore.delete).toHaveBeenCalledWith({ where: { id: 'h1', userId: 'u-1' } });
      expect(c.json).toHaveBeenCalledWith({ success: true });
    });
  });
});
