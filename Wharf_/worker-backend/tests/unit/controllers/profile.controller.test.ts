import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import type { Mock } from "vitest";
import { getProfile, generate, getHistory, getStats, deleteProfileItem } from '../../../src/controllers/profile.controller';
import { ProfileService } from '../../../src/services/profile.service';
import { AiService } from '../../../src/services/ai.service';
import { cacheService } from '../../../src/services/cache.service';
import { decrypt } from '../../../src/utils/encryption';
import { createMockContext } from '../test-utils';

let streamBuffer = '';

vi.mock('hono/streaming', () => ({
  streamText: vi.fn().mockImplementation(async (c: any, cb: any) => {
    const stream = {
      write: vi.fn().mockImplementation((chunk: any) => {
        streamBuffer += chunk;
        return Promise.resolve();
      })
    };
    await cb(stream);
    return { _isHonoResponse: true, streamed: true, buffer: streamBuffer };
  }),
}));

vi.mock('../../../src/services/profile.service');
vi.mock('../../../src/services/ai.service');
vi.mock('../../../src/services/cache.service');
vi.mock('../../../src/utils/encryption');
vi.mock('../../../src/utils/dailyStats', () => ({ recordDailyGeneration: vi.fn() }));
vi.mock('../../../src/utils/logger', () => ({
  loggerService: { info: vi.fn(), error: vi.fn(), stepStart: vi.fn(), stepEnd: vi.fn(), cacheHit: vi.fn() },
  saveRequestLog: vi.fn()
}));
vi.mock('../../../src/utils/asyncContext', () => ({ getContextData: vi.fn().mockReturnValue({ username: 'app-user' }) }));

vi.mock('../../../src/db', () => ({
  __esModule: true,
  default: {},
  getPrisma: vi.fn().mockReturnValue({
    user: { findUnique: vi.fn() },
    profileReadme: { findMany: vi.fn(), create: vi.fn(), count: vi.fn(), delete: vi.fn(), findUnique: vi.fn() },
    profileStats: { findFirst: vi.fn(), update: vi.fn(), create: vi.fn() },
    $executeRaw: vi.fn()
  })
}));

vi.mock('crypto', () => ({
  createHash: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('mocked-hash')
  })
}));

describe('ProfileController', () => {
  let mockEnv: any;
  let prismaObj: any;

  beforeEach(async () => {
    streamBuffer = '';
    vi.clearAllMocks();
    mockEnv = { ENCRYPTION_SECRET: 'secret', DATABASE_URL: 'postgres://' };
    prismaObj = (await import('../../../src/db')).getPrisma('');
  });

  describe('getProfile', () => {
    it('should inject DB user tokens and call ProfileService', async () => {
      const c = createMockContext({ params: { username: 'target-user' } }, mockEnv, { userId: 'u-1' });
      (prismaObj.user.findUnique as Mock).mockResolvedValue({ githubAccessToken: 'enc', installationId: 'inst-1' });
      (decrypt as Mock).mockReturnValue('decrypted');
      
      (ProfileService.prototype.getProfileData as Mock).mockResolvedValue({ name: 'Bob' });
      
      await getProfile(c);

      expect(prismaObj.user.findUnique).toHaveBeenCalledWith({ where: { id: 'u-1' }, select: expect.any(Object) });
      expect(decrypt).toHaveBeenCalledWith('enc', 'secret');
      expect(ProfileService).toHaveBeenCalledWith({ token: 'decrypted', installationId: 'inst-1' });
      expect(c.json).toHaveBeenCalledWith({ success: true, data: { name: 'Bob' } });
    });
  });

  describe('generate (Streaming)', () => {
    it('should stream AI profile and write to cache/DB', async () => {
      const c = createMockContext({ 
        body: { profileData: { username: 'target-user' }, options: { template: 'classic' } } 
      }, mockEnv, { userId: 'u-1' });
      
      (cacheService.getProfileReadme as Mock).mockResolvedValue(null);
      (AiService.prototype.generateProfileStream as Mock).mockImplementation(async (data: any, opts: any, uid: any, onChunk: any) => {
        onChunk('hello');
        onChunk(' markdown');
        return { text: 'hello markdown', provider: 'GEMINI' };
      });
      (prismaObj.profileReadme.create as Mock).mockResolvedValue({ id: 'r-1' });

      await generate(c);

      expect(streamBuffer).toContain(`data: ${JSON.stringify({ text: 'hello' })}\n\n`);
      expect(streamBuffer).toContain(`data: ${JSON.stringify({ text: ' markdown' })}\n\n`);
      expect(cacheService.setProfileReadme).toHaveBeenCalledWith(
        'target-user', 'classic', undefined, expect.any(String), 'hello markdown'
      );
      
      expect(prismaObj.profileReadme.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ userId: 'u-1', appUsername: 'unknown', username: 'target-user', content: 'hello markdown' })
      }));
      expect(prismaObj.$executeRaw).toHaveBeenCalled();
    });

    it('should return from strict cache stream logic if cache hit', async () => {
      const c = createMockContext({ 
        body: { profileData: { username: 'target-user' }, options: { template: 'classic' } } 
      }, mockEnv, { userId: 'u-1' });
      
      (cacheService.getProfileReadme as Mock).mockResolvedValue('Fast-Path');
      
      await generate(c);
      
      expect(streamBuffer).toContain(`data: ${JSON.stringify({ text: 'Fast-Path' })}\n\n`);
      expect(AiService.prototype.generateProfileStream).not.toHaveBeenCalled();
    });
  });

  describe('getStats & deleteProfileItem', () => {
    it('getStats calculates template dominance and unique maps', async () => {
      const c = createMockContext({}, mockEnv, { userId: 'u-1' });
      (prismaObj.profileReadme.findMany as Mock).mockResolvedValue([
        { username: 'x', template: 'T1', generatedAt: '2026-05-01' },
        { username: 'x', template: 'T2', generatedAt: '2026-06-01' }
      ]);
      
      await getStats(c);
      expect(c.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({ totalProfiles: 1, templatesUsed: 2 })
      }));
    });

    it('deleteProfileItem correctly handles prerequisites and raw DB writes', async () => {
      const c = createMockContext({ params: { id: 'prof-1' } }, mockEnv, { userId: 'u-1' });
      (prismaObj.profileReadme.findUnique as Mock).mockResolvedValue({ id: 'prof-1', userId: 'u-1' });
      (prismaObj.profileReadme.count as Mock).mockResolvedValue(4);
      
      await deleteProfileItem(c);
      
      expect(prismaObj.profileReadme.delete).toHaveBeenCalledWith({ where: { id: 'prof-1' }});
      expect(prismaObj.$executeRaw).toHaveBeenCalled();
    });
  });
});
