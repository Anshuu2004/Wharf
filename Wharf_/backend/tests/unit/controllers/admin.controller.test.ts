import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import type { Mock } from "vitest";
import { getPublicStats, getDashboardData } from '../../../src/controllers/admin.controller';
import { cacheGet, cacheSet, getCacheStats } from '../../../src/utils/redis';
import { createMockContext } from '../test-utils';

vi.mock('../../../src/utils/redis');
vi.mock('../../../src/db', () => ({
  __esModule: true,
  default: {},
  getPrisma: vi.fn().mockReturnValue({
    generation: { count: vi.fn(), aggregate: vi.fn(), findMany: vi.fn() },
    profileReadme: { count: vi.fn(), aggregate: vi.fn(), findMany: vi.fn() },
    healthScore: { count: vi.fn(), aggregate: vi.fn(), findMany: vi.fn() },
    changelog: { count: vi.fn(), aggregate: vi.fn(), findMany: vi.fn() },
    chatSession: { count: vi.fn(), findMany: vi.fn() },
    user: { count: vi.fn() },
    repository: { findMany: vi.fn() },
    chatAnalytics: { findMany: vi.fn() },
    userApiKey: { groupBy: vi.fn() },
    systemKey: { groupBy: vi.fn() },
    analytics: { aggregate: vi.fn() },
    $queryRaw: vi.fn(),
  })
}));

describe('AdminController', () => {
  let mockEnv: any;
  let prismaObj: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockEnv = { DATABASE_URL: 'post://' };
    prismaObj = (await import('../../../src/db')).getPrisma('');
    
    (getCacheStats as Mock).mockReturnValue({ hitRate: 85 });
  });

  describe('getPublicStats', () => {
    it('should return from strict public cache if available', async () => {
      const c = createMockContext({}, mockEnv);
      (cacheGet as Mock).mockImplementation((key: string) => {
        if (key === 'admin:dashboard:stats:week') return null;
        if (key === 'public:hero:stats') return JSON.stringify({ success: true, stats: { totalGenerations: 5 } });
        return null;
      });

      await getPublicStats(c);

      expect(c.json).toHaveBeenCalledWith({ success: true, stats: { totalGenerations: 5 } });
      expect(prismaObj.generation.count).not.toHaveBeenCalled();
    });

    it('should compute fallback if cache is empty', async () => {
      const c = createMockContext({}, mockEnv);
      (cacheGet as Mock).mockResolvedValue(null);

      const mCount = vi.fn().mockResolvedValue(10);
      prismaObj.generation.count = mCount;
      prismaObj.profileReadme.count = mCount;
      prismaObj.healthScore.count = mCount;
      prismaObj.changelog.count = mCount;
      prismaObj.chatSession.count = mCount;

      (prismaObj.$queryRaw as Mock).mockResolvedValue([{ totalTokens: 100n, totalReadmes: 5n }]);
      
      const mAgg = vi.fn().mockResolvedValue({ _count: 10, _sum: { wordCount: 500 } });
      prismaObj.generation.aggregate = mAgg;
      prismaObj.profileReadme.aggregate = mAgg;
      prismaObj.changelog.aggregate = mAgg;
      prismaObj.healthScore.aggregate = mAgg;
      prismaObj.chatAnalytics.findMany = vi.fn().mockResolvedValue([{ totalTokens: 50 }]);

      await getPublicStats(c);

      expect(prismaObj.generation.count).toHaveBeenCalled();
      expect(prismaObj.$queryRaw).toHaveBeenCalled();
      expect(cacheSet).toHaveBeenCalledWith('public:hero:stats', expect.any(String), 180);
      expect(c.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        stats: expect.objectContaining({ totalGenerations: expect.any(Number) })
      }));
    });
  });

  describe('getDashboardData', () => {
    it('should return cached dashboard data if period exists in cache', async () => {
      const c = createMockContext({ query: { period: 'week' } }, mockEnv);
      (cacheGet as Mock).mockResolvedValue(JSON.stringify({ stats: { totalUsers: 99 } }));
      
      await getDashboardData(c);
      
      expect(cacheGet).toHaveBeenCalledWith('admin:dashboard:stats:week');
      expect(c.json).toHaveBeenCalledWith({ stats: { totalUsers: 99 } });
    });

    it('should fully compute analytics if no cache', async () => {
      const c = createMockContext({ query: { period: 'week' } }, mockEnv);
      (cacheGet as Mock).mockResolvedValue(null);
      (prismaObj.user.count as Mock).mockResolvedValue(100);
      
      const mCount = vi.fn().mockResolvedValue(10);
      prismaObj.generation.count = mCount;
      prismaObj.profileReadme.count = mCount;
      prismaObj.healthScore.count = mCount;
      prismaObj.changelog.count = mCount;
      prismaObj.chatSession.count = mCount;

      (prismaObj.$queryRaw as Mock)
        .mockResolvedValueOnce([{ totalTokens: 100n, totalReadmes: 15n }]) // Lifetime
        .mockResolvedValueOnce([]) // Heatmap
        .mockResolvedValueOnce([]) // Trend
        .mockResolvedValueOnce([{ totalTokens: 1000n }]); // Token Total

      const mAgg = vi.fn().mockResolvedValue({ _count: 10, _sum: { wordCount: 500 } });
      prismaObj.generation.aggregate = mAgg;
      prismaObj.profileReadme.aggregate = mAgg;
      prismaObj.changelog.aggregate = mAgg;
      prismaObj.healthScore.aggregate = mAgg;

      (prismaObj.repository.findMany as Mock).mockResolvedValue([]);
      (prismaObj.userApiKey.groupBy as Mock).mockResolvedValue([{ provider: 'GEMINI', _sum: { usageCount: 5 } }]);
      (prismaObj.systemKey.groupBy as Mock).mockResolvedValue([]);
      (prismaObj.analytics.aggregate as Mock).mockResolvedValue({ _avg: { responseTime: 1200 } });

      const mFind = vi.fn().mockResolvedValue([]);
      prismaObj.generation.findMany = mFind;
      prismaObj.profileReadme.findMany = mFind;
      prismaObj.healthScore.findMany = mFind;
      prismaObj.changelog.findMany = mFind;
      prismaObj.chatSession.findMany = mFind;
      prismaObj.chatAnalytics.findMany = mFind;

      await getDashboardData(c);

      expect(cacheSet).toHaveBeenCalledWith('admin:dashboard:stats:week', expect.any(String), 60);
      expect(c.json).toHaveBeenCalledWith(expect.objectContaining({
        stats: expect.objectContaining({ totalUsers: 100, avgResponseTime: 2.3 }),
        providerData: expect.any(Array)
      }));
    });
  });
});
