import { loggerService, saveRequestLog, logger } from '../../../src/utils/logger';
import { getContextData } from '../../../src/utils/asyncContext';
import prisma from '../../../src/db';
import { describe, expect, test, jest, beforeEach } from '@jest/globals';

// Mock Dependencies
jest.mock('../../../src/utils/asyncContext', () => ({
  getContextData: jest.fn()
}));

jest.mock('../../../src/db', () => ({
  __esModule: true,
  default: {
    requestLog: {
      create: jest.fn()
    }
  }
}));

describe('logger Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getContextData as jest.Mock).mockReturnValue({
      requestId: 'test-req-1',
      userId: 'test-user-1',
      username: 'test-user-name'
    });
  });

  describe('saveRequestLog', () => {
    test('should map async context data into the request log and persist to DB', async () => {
      const mockLogData = {
        route: '/api/test',
        method: 'GET'
      };

      (prisma as any).requestLog.create.mockResolvedValue({});

      await saveRequestLog(mockLogData);

      expect((prisma as any).requestLog.create).toHaveBeenCalledWith({
        data: {
          ...mockLogData,
          requestId: 'test-req-1',
          userId: 'test-user-1',
          appUsername: 'test-user-name'
        }
      });
    });

    test('should not throw if prisma create fails', async () => {
      // Mock Logger To Prevent Error From Spamming Console During Test
      jest.spyOn(logger, 'error').mockImplementationOnce(() => undefined as any);
      (prisma as any).requestLog.create.mockRejectedValue(new Error('DB Error'));

      await expect(saveRequestLog({ route: '/api/test', method: 'GET' })).resolves.not.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('LoggerService', () => {
    test('should inject common context fields into structured logs via formatLog', () => {
      const spyInfo = jest.spyOn(logger, 'info').mockImplementation(() => undefined as any);
      
      loggerService.info('test.event', 'Test Message', { someData: true });

      expect(spyInfo).toHaveBeenCalledWith(
        {
          event: 'test.event',
          requestId: 'test-req-1',
          userId: 'test-user-1',
          username: 'test-user-name',
          someData: true
        },
        'Test Message'
      );
    });

    test('stepEnd should automatically inject durationMs relative to startMs', () => {
      const spyInfo = jest.spyOn(logger, 'info').mockImplementation(() => undefined as any);
      
      // We Know How Date.now() Behaves Relative To Now, But It Might Flake, So We Use FakeTimers
      jest.useFakeTimers();
      
      const startMs = Date.now();
      jest.advanceTimersByTime(200);

      loggerService.stepEnd('test.step', 'Step Finished', startMs, { metadata: 1 });

      const calledWithObj = spyInfo.mock.calls[0][0] as any;
      expect(calledWithObj.durationMs).toBeGreaterThanOrEqual(200);
      expect(calledWithObj.metadata).toBe(1);

      jest.useRealTimers();
    });
  });
});
