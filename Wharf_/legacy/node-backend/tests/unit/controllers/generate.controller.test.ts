import { Request, Response } from 'express';
import { generateReadme, getHistory, getHistoryById, deleteHistoryItem } from '../../../src/controllers/generate.controller';
import { cacheService } from '../../../src/services/cache.service';
import { RepoService } from '../../../src/services/repo.service';
import { aiService } from '../../../src/services/ai.service';
import prisma from '../../../src/db';

jest.mock('../../../src/services/cache.service');
jest.mock('../../../src/services/repo.service');
jest.mock('../../../src/services/ai.service');
jest.mock('../../../src/utils/logger', () => ({
  loggerService: { stepStart: jest.fn(), stepEnd: jest.fn(), info: jest.fn(), error: jest.fn(), cacheHit: jest.fn() },
  saveRequestLog: jest.fn(),
}));

jest.mock('../../../src/db', () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn() },
    repository: { upsert: jest.fn() },
    generation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
    $executeRaw: jest.fn()
  }
}));

describe('GenerateController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  let mockSetHeader: jest.Mock;
  let mockFlushHeaders: jest.Mock;
  let mockWrite: jest.Mock;
  let mockEnd: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockSetHeader = jest.fn();
    mockFlushHeaders = jest.fn();
    mockWrite = jest.fn();
    mockEnd = jest.fn();

    mockReq = {
      body: {},
      query: {},
      params: {},
      user: { userId: 'u-1' } as any,
      baseUrl: '/api',
      path: '/generate/readme',
      method: 'POST'
    };
    mockRes = {
      status: mockStatus,
      json: mockJson,
      setHeader: mockSetHeader,
      flushHeaders: mockFlushHeaders,
      write: mockWrite,
      end: mockEnd,
    };
  });

  describe('generateReadme', () => {
    it('should validate inputs', async () => {
      await generateReadme(mockReq as Request, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false, error: 'repoUrl, tone, and sections are required fields'
      });
    });

    it('should use cache if available and stream mock data', async () => {
      mockReq.body = { repoUrl: 'https://github.com/foo/bar', tone: 'tech', sections: ['s1'] };
      (cacheService.getReadme as jest.Mock).mockResolvedValue('cached stuff');

      await generateReadme(mockReq as Request, mockRes as Response);
      
      expect(mockSetHeader).toHaveBeenCalled();
      expect(mockWrite).toHaveBeenCalledWith(expect.stringContaining('cached stuff'));
      expect(mockWrite).toHaveBeenCalledWith('data: [DONE]\n\n');
      expect(mockEnd).toHaveBeenCalled();
      expect(RepoService.prototype.analyzeRepo).not.toHaveBeenCalled();
    });

    it('should fetch new analysis and save to DB on cache miss', async () => {
      mockReq.body = { repoUrl: 'https://github.com/foo/bar', tone: 'tech', sections: ['s1'] };
      (cacheService.getReadme as jest.Mock).mockResolvedValue(null);
      (RepoService.prototype.analyzeRepo as jest.Mock).mockResolvedValue({ meta: { name: 'repo' } });
      
      (aiService.generateReadmeStream as jest.Mock).mockImplementation(async (c, t, s, u, cb) => {
        cb('new chunk');
        return { text: 'new chunk', provider: 'GEMINI' };
      });

      (prisma.repository.upsert as jest.Mock).mockResolvedValue({ id: 'repo-1' });
      (prisma.generation.create as jest.Mock).mockResolvedValue({ id: 'gen-1' });

      await generateReadme(mockReq as Request, mockRes as Response);

      expect(mockWrite).toHaveBeenCalledWith(expect.stringContaining('new chunk'));
      expect(cacheService.setReadme).toHaveBeenCalled();
      expect(prisma.repository.upsert).toHaveBeenCalled();
      expect(prisma.generation.create).toHaveBeenCalled();
      expect(prisma.$executeRaw).toHaveBeenCalled();
      expect(mockEnd).toHaveBeenCalled();
    });
  });

  describe('History endpoints', () => {
    it('getHistory should return paginated data', async () => {
      (prisma.generation.findMany as jest.Mock).mockResolvedValue([{ id: 'g1' }]);
      await getHistory(mockReq as Request, mockRes as Response);
      expect(prisma.generation.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 50 }));
      expect(mockJson).toHaveBeenCalledWith({ success: true, data: [{ id: 'g1' }] });
    });

    it('deleteHistoryItem should sync high water mark and delete', async () => {
      mockReq.params = { id: 'g1' };
      (prisma.generation.findUnique as jest.Mock).mockResolvedValue({ repository: { userId: 'u-1' } });
      
      await deleteHistoryItem(mockReq as Request, mockRes as Response);
      
      expect(prisma.$executeRaw).toHaveBeenCalled();
      expect(prisma.generation.delete).toHaveBeenCalledWith({ where: { id: 'g1' } });
      expect(mockJson).toHaveBeenCalledWith({ success: true, message: 'Deleted successfully' });
    });
  });
});
