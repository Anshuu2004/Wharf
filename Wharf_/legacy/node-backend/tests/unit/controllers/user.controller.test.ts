import { Request, Response } from 'express';
import { 
  getUserRepos, getApiKeys, addApiKey, deleteApiKey, 
  getProfile, getUsageStats, clearUserData 
} from '../../../src/controllers/user.controller';
import { APIKeyService, GithubService, ProfileService } from '../../../src/services';
import prisma from '../../../src/db';
import { decrypt } from '../../../src/utils/encryption';

jest.mock('../../../src/services');
jest.mock('../../../src/utils/encryption');
jest.mock('../../../src/db', () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn(), update: jest.fn() },
    userApiKey: { findMany: jest.fn(), deleteMany: jest.fn() },
    userProfile: { upsert: jest.fn(), update: jest.fn() },
    chatSession: { count: jest.fn(), findMany: jest.fn(), deleteMany: jest.fn() },
    healthScore: { count: jest.fn(), findMany: jest.fn(), updateMany: jest.fn() },
    chatAnalytics: { aggregate: jest.fn() },
    generation: { aggregate: jest.fn(), findMany: jest.fn() },
    profileReadme: { aggregate: jest.fn(), findMany: jest.fn(), updateMany: jest.fn() },
    changelog: { aggregate: jest.fn(), findMany: jest.fn(), updateMany: jest.fn() },
    repository: { deleteMany: jest.fn() },
    $queryRaw: jest.fn(),
    $executeRawUnsafe: jest.fn(),
    $transaction: jest.fn(),
  }
}));

describe('UserController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockReq = {
      body: {}, query: {}, params: {}, user: { userId: 'u-1', githubAccessToken: 'enc' }
    };
    mockRes = { status: mockStatus, json: mockJson };
  });

  describe('getUserRepos', () => {
    it('should decrypt token and fetch repos from GithubService', async () => {
      (decrypt as jest.Mock).mockReturnValue('decrypted-token');
      (GithubService.prototype.fetchUserRepos as jest.Mock).mockResolvedValue(['repo1']);

      await getUserRepos(mockReq, mockRes as Response);

      expect(decrypt).toHaveBeenCalledWith('enc');
      expect(GithubService).toHaveBeenCalledWith({ token: 'decrypted-token' });
      expect(GithubService.prototype.fetchUserRepos).toHaveBeenCalledWith(1, 50);
      expect(mockJson).toHaveBeenCalledWith({ success: true, data: ['repo1'] });
    });
  });

  describe('addApiKey & getApiKeys', () => {
    it('addApiKey should invoke APIKeyService and return new key', async () => {
      mockReq.body = { key: 'sh-xxx', provider: 'GEMINI', label: 'My Key' };
      (APIKeyService.prototype.addKey as jest.Mock).mockResolvedValue({
        id: 'k-1', provider: 'GEMINI', label: 'My Key', lastFour: 'xxx', isVerified: true
      });

      await addApiKey(mockReq, mockRes as Response);

      expect(APIKeyService.prototype.addKey).toHaveBeenCalledWith('u-1', {
        key: 'sh-xxx', provider: 'GEMINI', label: 'My Key'
      });
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ status: 'valid' })
      });
    });

    it('getApiKeys should map raw keys to frontend format', async () => {
      (prisma.userApiKey.findMany as jest.Mock).mockResolvedValue([
        { id: '1', provider: 'GEMINI', label: 'A', lastFour: '1234', isVerified: true, isActive: true }
      ]);
      await getApiKeys(mockReq, mockRes as Response);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: [
          expect.objectContaining({ provider: 'gemini', keyPrefix: '••••1234' })
        ]
      });
    });
  });

  describe('getUsageStats', () => {
    it('should aggregate all tokens into dynamic total and sync DB sync if needed', async () => {
      (prisma.chatSession.count as jest.Mock).mockResolvedValue(1);
      (prisma.healthScore.count as jest.Mock).mockResolvedValue(1); // 213 tokens
      
      const aggMock = jest.fn().mockResolvedValue({ _count: 0, _sum: { wordCount: 0, totalTokens: 0 } });
      (prisma.chatAnalytics.aggregate as jest.Mock).mockImplementation(aggMock);
      (prisma.generation.aggregate as jest.Mock).mockImplementation(aggMock);
      (prisma.profileReadme.aggregate as jest.Mock).mockImplementation(aggMock);
      (prisma.changelog.aggregate as jest.Mock).mockImplementation(aggMock);

      (prisma.$queryRaw as jest.Mock).mockResolvedValue([
        { lifetimeTokens: 0n, lifetimeReadmes: 0n, lifetimeProfiles: 0n, lifetimeHealthChecks: 0n, lifetimeChangelogs: 0n, lifetimeChats: 0n }
      ]);
      
      const arrMock = jest.fn().mockResolvedValue([]);
      (prisma.generation.findMany as jest.Mock).mockImplementation(arrMock);
      (prisma.profileReadme.findMany as jest.Mock).mockImplementation(arrMock);
      (prisma.healthScore.findMany as jest.Mock).mockImplementation(arrMock);
      (prisma.changelog.findMany as jest.Mock).mockImplementation(arrMock);
      (prisma.chatSession.findMany as jest.Mock).mockImplementation(arrMock);

      await getUsageStats(mockReq, mockRes as Response);

      expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE "User" SET "lifetimeTokens" = 213')
      );
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });
  });

  describe('clearUserData', () => {
    it('should clear fields transactionally', async () => {
      await clearUserData(mockReq, mockRes as Response);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({ success: true, message: 'Data Cleared Successfully' });
    });
  });
});
