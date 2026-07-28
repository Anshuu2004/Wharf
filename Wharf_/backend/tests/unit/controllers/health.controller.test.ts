import { Request, Response } from 'express';
import { HealthController } from '../../../src/controllers/health.controller';
import { healthScoreService } from '../../../src/services/healthScore.service';
import { GithubService } from '../../../src/services/github.service';
import prisma from '../../../src/db';
import { decrypt } from '../../../src/utils/encryption';

jest.mock('../../../src/services/healthScore.service');
jest.mock('../../../src/services/github.service');
jest.mock('../../../src/utils/encryption');
jest.mock('../../../src/utils/dailyStats');
jest.mock('../../../src/utils/logger', () => ({
  loggerService: { error: jest.fn() }
}));
jest.mock('../../../src/db', () => ({
  __esModule: true,
  default: {
    healthScore: {
      upsert: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
    $executeRaw: jest.fn()
  }
}));

describe('HealthController', () => {
  let controller: HealthController;
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new HealthController();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockReq = {
      body: {},
      query: {},
      params: {},
      user: {} as any
    };
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
  });

  describe('analyzeReadmeHealth', () => {
    it('should return 400 if repoUrl is missing or invalid', async () => {
      mockReq.body = {};
      await controller.analyzeReadmeHealth(mockReq as Request, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ success: false, error: 'repoUrl is required' });

      mockReq.body = { repoUrl: 'invalid' };
      await controller.analyzeReadmeHealth(mockReq as Request, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ success: false, error: 'Invalid GitHub URL' });
    });

    it('should fetch readme, analyze it, save to DB, and record tokens if user is logged in', async () => {
      mockReq.body = { repoUrl: 'https://github.com/foo/bar' };
      (mockReq as any).user = { userId: 'u-1', githubAccessToken: 'enc' };

      (decrypt as jest.Mock).mockReturnValue('decrypted');
      (GithubService.prototype.getReadmeContent as jest.Mock).mockResolvedValue('# hello');

      const mockResult = { score: 100, breakdown: {}, suggestions: [] };
      (healthScoreService.analyzeReadmeHealth as jest.Mock).mockResolvedValue(mockResult);

      await controller.analyzeReadmeHealth(mockReq as Request, mockRes as Response);

      expect(decrypt).toHaveBeenCalledWith('enc');
      expect(GithubService).toHaveBeenCalledWith({ token: 'decrypted' });
      expect(GithubService.prototype.getReadmeContent).toHaveBeenCalledWith('foo', 'bar');
      expect(healthScoreService.analyzeReadmeHealth).toHaveBeenCalledWith('# hello');
      expect(prisma.healthScore.upsert).toHaveBeenCalled();
      expect(prisma.$executeRaw).toHaveBeenCalled();
      
      expect(mockJson).toHaveBeenCalledWith({ success: true, data: mockResult });
    });
  });

  describe('analyzeContributionReadiness', () => {
    it('should aggregate various github tests to produce contribution score', async () => {
      mockReq.body = { repoUrl: 'https://github.com/foo/bar' };
      
      (GithubService.prototype.getContributingFile as jest.Mock).mockResolvedValue(true);
      (GithubService.prototype.getIssueTemplates as jest.Mock).mockResolvedValue(['t1']);
      (GithubService.prototype.getPRTemplates as jest.Mock).mockResolvedValue([]);
      (GithubService.prototype.checkFileExists as jest.Mock).mockResolvedValue(false);
      (GithubService.prototype.getReadmeContent as jest.Mock).mockResolvedValue('readme');

      const mockScore = { score: 50, breakdown: {}, suggestions: [] };
      (healthScoreService.analyzeContributionReadiness as jest.Mock).mockResolvedValue(mockScore);

      await controller.analyzeContributionReadiness(mockReq as Request, mockRes as Response);

      expect(healthScoreService.analyzeContributionReadiness).toHaveBeenCalledWith(
        true, 1, 0, false, 'readme', false
      );
      expect(prisma.healthScore.updateMany).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({ success: true, data: mockScore });
    });
  });

  describe('History Methods', () => {
    it('getHistory should return paginated data', async () => {
      mockReq.user = { userId: 'u-1' } as any;
      (prisma.healthScore.findMany as jest.Mock).mockResolvedValue([{ id: 'h1' }]);

      await controller.getHistory(mockReq as Request, mockRes as Response);

      expect(prisma.healthScore.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 50 }));
      expect(mockJson).toHaveBeenCalledWith({ success: true, data: [{ id: 'h1' }] });
    });

    it('deleteHistory should trigger raw SQL limits and delete', async () => {
      mockReq.user = { userId: 'u-1' } as any;
      mockReq.params = { id: 'h1' };

      await controller.deleteHistory(mockReq as Request, mockRes as Response);

      expect(prisma.$executeRaw).toHaveBeenCalled();
      expect(prisma.healthScore.delete).toHaveBeenCalledWith({ where: { id: 'h1', userId: 'u-1' } });
      expect(mockJson).toHaveBeenCalledWith({ success: true });
    });
  });
});
