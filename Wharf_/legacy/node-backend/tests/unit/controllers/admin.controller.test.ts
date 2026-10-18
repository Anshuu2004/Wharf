import { Request, Response } from 'express';
import { getPublicStats, getDashboardData } from '../../../src/controllers/admin.controller';
import { cacheGet, cacheSet, getCacheStats } from '../../../src/utils/redis';
import prisma from '../../../src/db';

jest.mock('../../../src/utils/redis');
jest.mock('../../../src/db', () => ({
  __esModule: true,
  default: {
    generation: { count: jest.fn(), aggregate: jest.fn(), findMany: jest.fn() },
    profileReadme: { count: jest.fn(), aggregate: jest.fn(), findMany: jest.fn() },
    healthScore: { count: jest.fn(), aggregate: jest.fn(), findMany: jest.fn() },
    changelog: { count: jest.fn(), aggregate: jest.fn(), findMany: jest.fn() },
    chatSession: { count: jest.fn(), findMany: jest.fn() },
    user: { count: jest.fn() },
    repository: { findMany: jest.fn() },
    chatAnalytics: { findMany: jest.fn() },
    userApiKey: { groupBy: jest.fn() },
    systemKey: { groupBy: jest.fn() },
    analytics: { aggregate: jest.fn() },
    $queryRaw: jest.fn(),
  }
}));

describe('AdminController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockReq = {
      body: {}, query: {}, params: {}, user: { userId: 'u-1' }
    };
    mockRes = { status: mockStatus, json: mockJson };
    
    (getCacheStats as jest.Mock).mockReturnValue({ hitRate: 85 });
  });

  describe('getPublicStats', () => {
    it('should return from strict public cache if available', async () => {
      (cacheGet as jest.Mock).mockImplementation((key) => {
        if (key === 'admin:dashboard:stats:week') return null;
        if (key === 'public:hero:stats') return JSON.stringify({ success: true, stats: { totalGenerations: 5 } });
        return null;
      });

      await getPublicStats(mockReq, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith({ success: true, stats: { totalGenerations: 5 } });
      expect(prisma.generation.count).not.toHaveBeenCalled();
    });

    it('should compute fallback if cache is empty', async () => {
      (cacheGet as jest.Mock).mockResolvedValue(null);

      const mCount = jest.fn().mockResolvedValue(10);
      prisma.generation.count = mCount;
      prisma.profileReadme.count = mCount;
      prisma.healthScore.count = mCount;
      prisma.changelog.count = mCount;
      prisma.chatSession.count = mCount;

      (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ totalTokens: 100n, totalReadmes: 5n }]);
      
      const mAgg = jest.fn().mockResolvedValue({ _count: 10, _sum: { wordCount: 500 } });
      prisma.generation.aggregate = mAgg;
      prisma.profileReadme.aggregate = mAgg;
      prisma.changelog.aggregate = mAgg;
      prisma.healthScore.aggregate = mAgg;
      prisma.chatAnalytics.findMany = jest.fn().mockResolvedValue([{ totalTokens: 50 }]);

      await getPublicStats(mockReq, mockRes as Response);

      expect(prisma.generation.count).toHaveBeenCalled();
      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(cacheSet).toHaveBeenCalledWith('public:hero:stats', expect.any(String), 180);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        stats: expect.objectContaining({ totalGenerations: expect.any(Number) })
      }));
    });
  });

  describe('getDashboardData', () => {
    it('should return cached dashboard data if period exists in cache', async () => {
      mockReq.query.period = 'week';
      (cacheGet as jest.Mock).mockResolvedValue(JSON.stringify({ stats: { totalUsers: 99 } }));
      
      await getDashboardData(mockReq, mockRes as Response);
      
      expect(cacheGet).toHaveBeenCalledWith('admin:dashboard:stats:week');
      expect(mockJson).toHaveBeenCalledWith({ stats: { totalUsers: 99 } });
    });

    it('should fully compute analytics if no cache', async () => {
      (cacheGet as jest.Mock).mockResolvedValue(null);
      (prisma.user.count as jest.Mock).mockResolvedValue(100);
      
      const mCount = jest.fn().mockResolvedValue(10);
      prisma.generation.count = mCount;
      prisma.profileReadme.count = mCount;
      prisma.healthScore.count = mCount;
      prisma.changelog.count = mCount;
      prisma.chatSession.count = mCount;

      (prisma.$queryRaw as jest.Mock)
        .mockResolvedValueOnce([{ totalTokens: 100n, totalReadmes: 15n }]) // Lifetime
        .mockResolvedValueOnce([]) // Heatmap
        .mockResolvedValueOnce([]) // Trend
        .mockResolvedValueOnce([{ totalTokens: 1000n }]); // Token Total

      const mAgg = jest.fn().mockResolvedValue({ _count: 10, _sum: { wordCount: 500 } });
      prisma.generation.aggregate = mAgg;
      prisma.profileReadme.aggregate = mAgg;
      prisma.changelog.aggregate = mAgg;
      prisma.healthScore.aggregate = mAgg;

      (prisma.repository.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.userApiKey.groupBy as jest.Mock).mockResolvedValue([{ provider: 'GEMINI', _sum: { usageCount: 5 } }]);
      (prisma.systemKey.groupBy as jest.Mock).mockResolvedValue([]);
      (prisma.analytics.aggregate as jest.Mock).mockResolvedValue({ _avg: { responseTime: 1200 } });

      const mFind = jest.fn().mockResolvedValue([]);
      prisma.generation.findMany = mFind;
      prisma.profileReadme.findMany = mFind;
      prisma.healthScore.findMany = mFind;
      prisma.changelog.findMany = mFind;
      prisma.chatSession.findMany = mFind;
      prisma.chatAnalytics.findMany = mFind;

      await getDashboardData(mockReq, mockRes as Response);

      expect(cacheSet).toHaveBeenCalledWith('admin:dashboard:stats:week', expect.any(String), 60);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        stats: expect.objectContaining({ totalUsers: 100, avgResponseTime: 1.2 }),
        providerData: expect.any(Array)
      }));
    });
  });
});
