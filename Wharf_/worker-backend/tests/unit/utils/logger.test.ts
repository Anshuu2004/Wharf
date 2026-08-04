import { loggerService, saveRequestLog } from '../../../src/utils/logger';
import { describe, expect, test, vi, beforeEach } from 'vitest';

vi.mock('../../../src/db', () => ({
  __esModule: true,
  default: {},
  getPrisma: vi.fn().mockReturnValue({
    requestLog: {
      create: vi.fn()
    }
  })
}));

describe('logger Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveRequestLog', () => {
    test('should map properties into request log and persist to DB', async () => {
      const mockLogData = {
        route: '/api/test',
        method: 'GET'
      };

      const prismaObj = await import('../../../src/db');
      const prismaMock = prismaObj.getPrisma('');
      (prismaMock.requestLog.create as any).mockResolvedValue({});

      await saveRequestLog(mockLogData);

      expect(prismaMock.requestLog.create).toHaveBeenCalledWith({
        data: mockLogData
      });
    });

    test('should not throw if prisma create fails', async () => {
      const prismaObj = await import('../../../src/db');
      const prismaMock = prismaObj.getPrisma('');
      (prismaMock.requestLog.create as any).mockRejectedValue(new Error('DB Error'));

      await expect(saveRequestLog({ route: '/api/test', method: 'GET' })).resolves.not.toThrow();
    });
  });

  describe('LoggerService', () => {
    test('should console.log structured data in info', () => {
      const spyLog = vi.spyOn(console, 'log').mockImplementation(() => undefined as any);
      loggerService.info('test.event', 'Test Message', { someData: true });
      expect(spyLog).toHaveBeenCalledWith('[INFO] [test.event] Test Message', { someData: true });
      spyLog.mockRestore();
    });

    test('stepEnd should automatically compute durationMs relative to startMs', () => {
      const spyLog = vi.spyOn(console, 'log').mockImplementation(() => undefined as any);
      
      vi.useFakeTimers();
      const startMs = Date.now();
      vi.advanceTimersByTime(200);

      loggerService.stepEnd('test.step', 'Step Finished', startMs, { metadata: 1 });

      const calledWithObj = spyLog.mock.calls[0][1] as any;
      expect(calledWithObj.durationMs).toBeGreaterThanOrEqual(200);
      expect(calledWithObj.metadata).toBe(1);

      vi.useRealTimers();
      spyLog.mockRestore();
    });
  });
});
