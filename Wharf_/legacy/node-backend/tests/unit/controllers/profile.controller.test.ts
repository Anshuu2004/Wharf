import { Request, Response } from 'express';
import { getProfile, generate, getHistory, getStats, deleteProfileItem } from '../../../src/controllers/profile.controller';
import { ProfileService } from '../../../src/services/profile.service';
import { aiService } from '../../../src/services/ai.service';
import { cacheService } from '../../../src/services/cache.service';
import prisma from '../../../src/db';
import { decrypt } from '../../../src/utils/encryption';
import { loggerService, saveRequestLog } from '../../../src/utils/logger';
import { getContextData } from '../../../src/utils/asyncContext';

jest.mock('../../../src/services/profile.service');
jest.mock('../../../src/services/ai.service');
jest.mock('../../../src/services/cache.service');
jest.mock('../../../src/utils/encryption');
jest.mock('../../../src/utils/dailyStats', () => ({ recordDailyGeneration: jest.fn() }));
jest.mock('../../../src/utils/logger', () => ({
  loggerService: { info: jest.fn(), error: jest.fn(), stepStart: jest.fn(), stepEnd: jest.fn(), cacheHit: jest.fn() },
  saveRequestLog: jest.fn()
}));
jest.mock('../../../src/utils/asyncContext', () => ({ getContextData: jest.fn() }));

jest.mock('../../../src/db', () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn() },
    profileReadme: { findMany: jest.fn(), create: jest.fn(), count: jest.fn(), delete: jest.fn(), findUnique: jest.fn() },
    profileStats: { findFirst: jest.fn(), update: jest.fn(), create: jest.fn() },
    $executeRaw: jest.fn()
  }
}));

jest.mock('crypto', () => ({
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mocked-hash')
  })
}));

describe('ProfileController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  let mockWrite: jest.Mock;
  let mockEnd: jest.Mock;
  let mockSetHeader: jest.Mock;
  let mockFlush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJson = jest.fn();
    mockWrite = jest.fn();
    mockEnd = jest.fn();
    mockSetHeader = jest.fn();
    mockFlush = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockReq = {
      body: {}, query: {}, params: {}, user: { userId: 'u-1' }, baseUrl: '/api', path: '/profile', method: 'POST'
    };
    mockRes = { status: mockStatus, json: mockJson, write: mockWrite, end: mockEnd, setHeader: mockSetHeader, flushHeaders: mockFlush };
    (getContextData as jest.Mock).mockReturnValue({ username: 'app-user' });
  });

  describe('getProfile', () => {
    it('should inject DB user tokens and call ProfileService', async () => {
      mockReq.params = { username: 'target-user' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ githubAccessToken: 'enc', installationId: 'inst-1' });
      (decrypt as jest.Mock).mockReturnValue('decrypted');
      
      (ProfileService.prototype.getProfileData as jest.Mock).mockResolvedValue({ name: 'Bob' });
      await getProfile(mockReq, mockRes as Response);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'u-1' }, select: expect.any(Object) });
      expect(decrypt).toHaveBeenCalledWith('enc');
      expect(ProfileService).toHaveBeenCalledWith({ token: 'decrypted', installationId: 'inst-1' });
      expect(mockJson).toHaveBeenCalledWith({ success: true, data: { name: 'Bob' } });
    });
  });

  describe('generate (Streaming)', () => {
    it('should stream AI profile and write to cache/DB', async () => {
      mockReq.body = { profileData: { username: 'target-user' }, options: { template: 'classic' } };
      
      (cacheService.getProfileReadme as jest.Mock).mockResolvedValue(null);
      (aiService.generateProfileStream as jest.Mock).mockImplementation(async (data, opts, uid, onChunk) => {
        onChunk('hello');
        onChunk(' markdown');
        return { text: 'hello markdown', provider: 'GEMINI' };
      });
      (prisma.profileReadme.create as jest.Mock).mockResolvedValue({ id: 'r-1' });

      await generate(mockReq, mockRes as Response);

      expect(mockFlush).toHaveBeenCalled();
      expect(mockWrite).toHaveBeenCalledWith(`data: ${JSON.stringify({ text: 'hello' })}\n\n`);
      expect(mockWrite).toHaveBeenCalledWith(`data: ${JSON.stringify({ text: ' markdown' })}\n\n`);
      expect(cacheService.setProfileReadme).toHaveBeenCalledWith(
        'target-user', 'classic', undefined, 'mocked-hash', 'hello markdown'
      );
      
      expect(prisma.profileReadme.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ userId: 'u-1', appUsername: 'app-user', username: 'target-user', content: 'hello markdown' })
      }));
      expect(prisma.$executeRaw).toHaveBeenCalled();
      expect(mockEnd).toHaveBeenCalled();
    });

    it('should return from strict cache stream logic if cache hit', async () => {
      mockReq.body = { profileData: { username: 'target-user' }, options: { template: 'classic' } };
      (cacheService.getProfileReadme as jest.Mock).mockResolvedValue('Fast-Path');
      
      await generate(mockReq, mockRes as Response);
      
      expect(mockWrite).toHaveBeenCalledWith(`data: ${JSON.stringify({ text: 'Fast-Path' })}\n\n`);
      expect(aiService.generateProfileStream).not.toHaveBeenCalled();
      expect(mockEnd).toHaveBeenCalled();
    });
  });

  describe('getStats & deleteProfileItem', () => {
    it('getStats calculates template dominance and unique maps', async () => {
      (prisma.profileReadme.findMany as jest.Mock).mockResolvedValue([
        { username: 'x', template: 'T1', generatedAt: '2026-05-01' },
        { username: 'x', template: 'T2', generatedAt: '2026-06-01' }
      ]);
      await getStats(mockReq, mockRes as Response);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({ totalProfiles: 1, templatesUsed: 2 })
      }));
    });

    it('deleteProfileItem correctly handles prerequisites and raw DB writes', async () => {
      mockReq.params = { id: 'prof-1' };
      (prisma.profileReadme.findUnique as jest.Mock).mockResolvedValue({ id: 'prof-1', userId: 'u-1' });
      (prisma.profileReadme.count as jest.Mock).mockResolvedValue(4);
      
      await deleteProfileItem(mockReq, mockRes as Response);
      
      expect(prisma.profileReadme.delete).toHaveBeenCalledWith({ where: { id: 'prof-1' }});
      expect(prisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
