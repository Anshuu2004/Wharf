import { Request, Response } from 'express';
import { analyzeRepo } from '../../../src/controllers/repo.controller';
import { RepoService } from '../../../src/services/repo.service';
import { decrypt } from '../../../src/utils/encryption';
import prisma from '../../../src/db';

jest.mock('../../../src/services/repo.service');
jest.mock('../../../src/utils/encryption');
jest.mock('../../../src/db', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    }
  }
}));

describe('RepoController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockReq = {
      body: {},
      user: {} as any
    };
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
  });

  describe('analyzeRepo', () => {
    it('should return 400 if repoUrl is missing', async () => {
      mockReq.body = {};
      await analyzeRepo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ success: false, error: 'Repository URL is required' });
    });

    it('should inject DB user tokens and return 200 on successful analysis', async () => {
      mockReq.body = { repoUrl: 'https://github.com/a/b' };
      (mockReq as any).user = { userId: 'u-1' }; // No Token In JWT

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        githubAccessToken: 'encrypted-token',
        installationId: 'inst-id'
      });
      (decrypt as jest.Mock).mockReturnValue('clear-token');

      const mockAnalysisResult = { meta: { name: 'b' } };
      (RepoService.prototype.analyzeRepo as jest.Mock).mockResolvedValue(mockAnalysisResult);

      await analyzeRepo(mockReq as Request, mockRes as Response);

      // Verified Decrypt & DB Query Logic
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'u-1' }, select: { githubAccessToken: true, installationId: true } });
      expect(decrypt).toHaveBeenCalledWith('encrypted-token');
      expect(RepoService).toHaveBeenCalledWith({ token: 'clear-token', installationId: 'inst-id' });

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockAnalysisResult
      });
    });

    it('should handle service errors normally', async () => {
      mockReq.body = { repoUrl: 'https://github.com/a/b' };
      const err = new Error('Not found') as any;
      err.status = 404;
      (RepoService.prototype.analyzeRepo as jest.Mock).mockRejectedValue(err);

      await analyzeRepo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ success: false, error: 'Not found' });
    });
  });
});
