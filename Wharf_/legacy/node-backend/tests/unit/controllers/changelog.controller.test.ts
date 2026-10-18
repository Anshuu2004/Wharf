import { Request, Response } from 'express';
import { ChangelogController } from '../../../src/controllers/changelog.controller';
import { aiService, ChangelogService, GithubService, cacheService } from '../../../src/services';
import prisma from '../../../src/db';
import { decrypt } from '../../../src/utils/encryption';
import { loggerService, saveRequestLog } from '../../../src/utils/logger';

jest.mock('../../../src/services');
jest.mock('../../../src/utils/encryption');
jest.mock('../../../src/db', () => ({
  __esModule: true,
  default: {
    changelog: { create: jest.fn() },
    $executeRaw: jest.fn()
  }
}));
jest.mock('../../../src/utils/logger', () => ({
  loggerService: { info: jest.fn(), error: jest.fn(), stepStart: jest.fn(), stepEnd: jest.fn(), cacheHit: jest.fn() },
  saveRequestLog: jest.fn()
}));
jest.mock('../../../src/utils/dailyStats', () => ({ recordDailyGeneration: jest.fn() }));

describe('ChangelogController', () => {
  let controller: ChangelogController;
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  let mockWrite: jest.Mock;
  let mockEnd: jest.Mock;
  let mockSetHeader: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ChangelogController();
    mockJson = jest.fn();
    mockWrite = jest.fn();
    mockEnd = jest.fn();
    mockSetHeader = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockReq = {
      body: {}, query: {}, params: {}, user: { userId: 'u-1', githubAccessToken: 'enc' }, baseUrl: '/api', path: '/changelog', method: 'POST'
    };
    mockRes = { status: mockStatus, json: mockJson, write: mockWrite, end: mockEnd, setHeader: mockSetHeader };
  });

  describe('getStats', () => {
    it('should return 400 if repoUrl is missing', async () => {
      await controller.getStats(mockReq, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ success: false, error: 'repoUrl is required' });
    });

    it('should fetch stats via ChangelogService if token exists', async () => {
      mockReq.body = { repoUrl: 'foo/bar' };
      (decrypt as jest.Mock).mockReturnValue('dec-token');
      (ChangelogService.prototype.getCommitStats as jest.Mock).mockResolvedValue({ totalCommits: 5 });

      await controller.getStats(mockReq, mockRes as Response);

      expect(decrypt).toHaveBeenCalledWith('enc');
      expect(ChangelogService.prototype.getCommitStats).toHaveBeenCalledWith('foo/bar', 'dec-token');
      expect(mockJson).toHaveBeenCalledWith({ success: true, data: { totalCommits: 5 } });
    });
  });

  describe('generate (Streaming)', () => {
    it('should return cached stream if hit', async () => {
      mockReq.body = { repoUrl: 'foo/bar', options: {} };
      (cacheService.getChangelog as jest.Mock).mockResolvedValue('Cached MD');

      await controller.generate(mockReq, mockRes as Response);

      expect(cacheService.getChangelog).toHaveBeenCalledWith('foo/bar', {});
      expect(loggerService.cacheHit).toHaveBeenCalledWith('foo/bar');
      expect(mockWrite).toHaveBeenCalledWith(`data: ${JSON.stringify({ text: 'Cached MD' })}\n\n`);
      expect(mockEnd).toHaveBeenCalled();
    });

    it('should generate via stream, cache it, and save to DB if logged in user', async () => {
      mockReq.body = { repoUrl: 'foo/bar', options: { format: 'keep' } };
      (cacheService.getChangelog as jest.Mock).mockResolvedValue(null);

      const mockStream = (async function* () {
        yield '# Log';
        yield '...';
      })();

      (ChangelogService.prototype.generateChangelog as jest.Mock).mockResolvedValue({
        stream: mockStream, provider: 'GEMINI'
      });

      (prisma.changelog.create as jest.Mock).mockResolvedValue({ id: 'cl-1' });

      await controller.generate(mockReq, mockRes as Response);

      expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      expect(mockWrite).toHaveBeenCalledWith(`data: ${JSON.stringify({ text: '# Log' })}\n\n`);
      expect(mockWrite).toHaveBeenCalledWith(`data: ${JSON.stringify({ text: '...' })}\n\n`);

      expect(cacheService.setChangelog).toHaveBeenCalledWith('foo/bar', { format: 'keep' }, '# Log...');
      expect(prisma.changelog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ content: '# Log...', userId: 'u-1', repoName: 'foo/bar' })
      }));
      expect(saveRequestLog).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 200 }));
    });
  });

  describe('getHistory & deleteChangelog', () => {
    it('getHistory calls service securely', async () => {
      (ChangelogService.prototype.getHistory as jest.Mock).mockResolvedValue(['h1']);
      await controller.getHistory(mockReq, mockRes as Response);
      expect(mockJson).toHaveBeenCalledWith({ success: true, data: ['h1'] });
    });

    it('delete calls service securely', async () => {
      mockReq.params = { id: 'log-1' };
      await controller.deleteChangelog(mockReq, mockRes as Response);
      expect(ChangelogService.prototype.deleteChangelog).toHaveBeenCalledWith('log-1', 'u-1');
      expect(mockJson).toHaveBeenCalledWith({ success: true });
    });
  });
});
