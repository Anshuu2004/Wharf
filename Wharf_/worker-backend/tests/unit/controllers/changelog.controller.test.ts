import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import type { Mock } from "vitest";
import { ChangelogController } from '../../../src/controllers/changelog.controller';
import { ChangelogService, GithubService, cacheService } from '../../../src/services';
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

vi.mock('../../../src/services');
vi.mock('../../../src/utils/encryption');
vi.mock('../../../src/db', () => ({
  __esModule: true,
  default: {},
  getPrisma: vi.fn().mockReturnValue({
    changelog: { create: vi.fn() },
    $executeRaw: vi.fn()
  })
}));
vi.mock('../../../src/utils/logger', () => ({
  loggerService: { info: vi.fn(), error: vi.fn(), stepStart: vi.fn(), stepEnd: vi.fn(), cacheHit: vi.fn() },
  saveRequestLog: vi.fn()
}));
vi.mock('../../../src/utils/dailyStats', () => ({ recordDailyGeneration: vi.fn() }));

describe('ChangelogController', () => {
  let controller: ChangelogController;
  let mockEnv: any;
  let prismaObj: any;

  beforeEach(async () => {
    streamBuffer = '';
    vi.clearAllMocks();
    controller = new ChangelogController();
    mockEnv = { ENCRYPTION_SECRET: 'secret', DATABASE_URL: 'post://' };
    prismaObj = (await import('../../../src/db')).getPrisma('');
  });

  describe('getStats', () => {
    it('should return 400 if repoUrl is missing', async () => {
      const c = createMockContext({ body: {} }, mockEnv);
      await controller.getStats(c);
      expect(c.json).toHaveBeenCalledWith({ success: false, error: 'repoUrl is required' }, 400);
    });

    it('should fetch stats via ChangelogService if token exists', async () => {
      const c = createMockContext({ body: { repoUrl: 'foo/bar' } }, mockEnv, { userId: 'u-1', githubAccessToken: 'enc' });
      (decrypt as Mock).mockReturnValue('dec-token');
      (ChangelogService.prototype.getCommitStats as Mock).mockResolvedValue({ totalCommits: 5 });

      await controller.getStats(c);

      expect(decrypt).toHaveBeenCalledWith('enc', 'secret');
      expect(ChangelogService.prototype.getCommitStats).toHaveBeenCalledWith('foo/bar', 'dec-token');
      expect(c.json).toHaveBeenCalledWith({ success: true, data: { totalCommits: 5 } });
    });
  });

  describe('generate (Streaming)', () => {
    it('should return cached stream if hit', async () => {
      const c = createMockContext({ body: { repoUrl: 'foo/bar', options: {} } }, mockEnv);
      (cacheService.getChangelog as Mock).mockResolvedValue('Cached MD');

      await controller.generate(c);

      expect(cacheService.getChangelog).toHaveBeenCalledWith('foo/bar', {});
      expect(streamBuffer).toContain(`data: ${JSON.stringify({ text: 'Cached MD' })}\n\n`);
    });

    it('should generate via stream, cache it, and save to DB if logged in user', async () => {
      const c = createMockContext({ body: { repoUrl: 'foo/bar', options: { format: 'keep' } } }, mockEnv, { userId: 'u-1' });
      (cacheService.getChangelog as Mock).mockResolvedValue(null);

      const mockStream = (async function* () {
        yield '# Log';
        yield '...';
      })();

      (ChangelogService.prototype.generateChangelog as Mock).mockResolvedValue({
        stream: mockStream, provider: 'GEMINI'
      });

      (prismaObj.changelog.create as Mock).mockResolvedValue({ id: 'cl-1' });

      await controller.generate(c);

      expect(streamBuffer).toContain(`data: ${JSON.stringify({ text: '# Log' })}\n\n`);
      expect(streamBuffer).toContain(`data: ${JSON.stringify({ text: '...' })}\n\n`);

      expect(cacheService.setChangelog).toHaveBeenCalledWith('foo/bar', { format: 'keep' }, '# Log...');
      expect(prismaObj.changelog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ content: '# Log...', userId: 'u-1', repoName: 'foo/bar' })
      }));
    });
  });

  describe('getHistory & deleteChangelog', () => {
    it('getHistory calls service securely', async () => {
      const c = createMockContext({}, mockEnv, { userId: 'u-1' });
      (ChangelogService.prototype.getHistory as Mock).mockResolvedValue(['h1']);
      
      await controller.getHistory(c);
      
      expect(c.json).toHaveBeenCalledWith({ success: true, data: ['h1'] });
    });

    it('delete calls service securely', async () => {
      const c = createMockContext({ params: { id: 'log-1' } }, mockEnv, { userId: 'u-1' });
      await controller.deleteChangelog(c);
      
      expect(ChangelogService.prototype.deleteChangelog).toHaveBeenCalledWith('log-1', 'u-1');
      expect(c.json).toHaveBeenCalledWith({ success: true });
    });
  });
});
