import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import type { Mock } from "vitest";
import { 
  getUserRepos, getApiKeys, addApiKey, deleteApiKey, 
  getProfile, getUsageStats, clearUserData 
} from '../../../src/controllers/user.controller';
import { APIKeyService, GithubService, ProfileService } from '../../../src/services';
import { decrypt } from '../../../src/utils/encryption';
import { createMockContext } from '../test-utils';

vi.mock('../../../src/services');
vi.mock('../../../src/utils/encryption');
vi.mock('../../../src/db', () => ({
  __esModule: true,
  default: {},
  getPrisma: vi.fn().mockReturnValue({
    user: { findUnique: vi.fn(), update: vi.fn() },
    userApiKey: { findMany: vi.fn(), deleteMany: vi.fn() },
    userProfile: { upsert: vi.fn(), update: vi.fn() },
    chatSession: { count: vi.fn(), findMany: vi.fn(), deleteMany: vi.fn() },
    healthScore: { count: vi.fn(), findMany: vi.fn(), updateMany: vi.fn() },
    chatAnalytics: { aggregate: vi.fn() },
    generation: { aggregate: vi.fn(), findMany: vi.fn() },
    profileReadme: { aggregate: vi.fn(), findMany: vi.fn(), updateMany: vi.fn() },
    changelog: { aggregate: vi.fn(), findMany: vi.fn(), updateMany: vi.fn() },
    repository: { deleteMany: vi.fn() },
    $queryRaw: vi.fn(),
    $executeRawUnsafe: vi.fn(),
    $transaction: vi.fn((fn: any) => fn()), 
  })
}));

describe('UserController', () => {
  let mockEnv: any;
  let prismaObj: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockEnv = { ENCRYPTION_SECRET: 'secret', DATABASE_URL: 'post://' };
    prismaObj = (await import('../../../src/db')).getPrisma('');
  });

  describe('getUserRepos', () => {
    it('should decrypt token and fetch repos from GithubService', async () => {
      const c = createMockContext({ query: { page: '1', limit: '50' } }, mockEnv, { userId: 'u-1', githubAccessToken: 'enc' });
      (decrypt as Mock).mockReturnValue('decrypted-token');
      (GithubService.prototype.fetchUserRepos as Mock).mockResolvedValue(['repo1']);

      await getUserRepos(c);

      expect(decrypt).toHaveBeenCalledWith('enc', 'secret');
      expect(GithubService).toHaveBeenCalledWith({ token: 'decrypted-token' });
      expect(GithubService.prototype.fetchUserRepos).toHaveBeenCalledWith(1, 50);
      expect(c.json).toHaveBeenCalledWith({ success: true, data: ['repo1'] });
    });
  });

  describe('addApiKey & getApiKeys', () => {
    it('addApiKey should invoke APIKeyService and return new key', async () => {
      const c = createMockContext({ body: { key: 'sh-xxx', provider: 'GEMINI', label: 'My Key' } }, mockEnv, { userId: 'u-1' });
      (APIKeyService.prototype.addKey as Mock).mockResolvedValue({
        id: 'k-1', provider: 'GEMINI', label: 'My Key', lastFour: 'xxx', isVerified: true
      });

      await addApiKey(c);

      expect(APIKeyService.prototype.addKey).toHaveBeenCalledWith('u-1', {
        key: 'sh-xxx', provider: 'GEMINI', label: 'My Key'
      });
      expect(c.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ status: 'valid' })
      });
    });

    it('getApiKeys should map raw keys to frontend format', async () => {
      const c = createMockContext({}, mockEnv, { userId: 'u-1' });
      (prismaObj.userApiKey.findMany as Mock).mockResolvedValue([
        { id: '1', provider: 'GEMINI', label: 'A', lastFour: '1234', isVerified: true, isActive: true }
      ]);
      await getApiKeys(c);
      
      expect(c.json).toHaveBeenCalledWith({
        success: true,
        data: [
          expect.objectContaining({ provider: 'gemini', keyPrefix: '••••1234' })
        ]
      });
    });
  });

  describe('getUsageStats', () => {
    it('should aggregate all tokens into dynamic total and sync DB sync if needed', async () => {
      const c = createMockContext({}, mockEnv, { userId: 'u-1' });

      (prismaObj.chatSession.count as Mock).mockResolvedValue(1);
      (prismaObj.healthScore.count as Mock).mockResolvedValue(1); 
      
      const aggMock = vi.fn().mockResolvedValue({ _count: 0, _sum: { wordCount: 0, totalTokens: 0 } });
      (prismaObj.chatAnalytics.aggregate as Mock).mockImplementation(aggMock);
      (prismaObj.generation.aggregate as Mock).mockImplementation(aggMock);
      (prismaObj.profileReadme.aggregate as Mock).mockImplementation(aggMock);
      (prismaObj.changelog.aggregate as Mock).mockImplementation(aggMock);

      (prismaObj.$queryRaw as Mock).mockResolvedValue([
        { lifetimeTokens: 0n, lifetimeReadmes: 0n, lifetimeProfiles: 0n, lifetimeHealthChecks: 0n, lifetimeChangelogs: 0n, lifetimeChats: 0n }
      ]);
      
      const arrMock = vi.fn().mockResolvedValue([]);
      (prismaObj.generation.findMany as Mock).mockImplementation(arrMock);
      (prismaObj.profileReadme.findMany as Mock).mockImplementation(arrMock);
      (prismaObj.healthScore.findMany as Mock).mockImplementation(arrMock);
      (prismaObj.changelog.findMany as Mock).mockImplementation(arrMock);
      (prismaObj.chatSession.findMany as Mock).mockImplementation(arrMock);

      await getUsageStats(c);

      expect(prismaObj.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE "User" SET "lifetimeTokens" =')
      );
      expect(c.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });
  });

  describe('clearUserData', () => {
    it('should clear fields transactionally', async () => {
      const c = createMockContext({}, mockEnv, { userId: 'u-1' });
      await clearUserData(c);
      expect(c.json).toHaveBeenCalledWith({ success: true });
    });
  });
});
