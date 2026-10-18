import { initCronJobs } from '../../../src/utils/cron';
import cron from 'node-cron';
import { KeyRouterService } from '../../../src/services/keyRouter.service';
import { loggerService } from '../../../src/utils/logger';
import { describe, expect, test, jest, beforeEach } from '@jest/globals';

jest.mock('node-cron', () => ({
  schedule: jest.fn()
}));

jest.mock('../../../src/services/keyRouter.service', () => ({
  KeyRouterService: jest.fn().mockImplementation(() => ({
    resetAllExhaustedKeys: jest.fn<any>().mockResolvedValue(undefined)
  }))
}));

jest.mock('../../../src/utils/logger', () => ({
  loggerService: {
    cronStarted: jest.fn(),
    cronCompleted: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));

describe('cron Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize cron jobs', () => {
    initCronJobs();

    expect(cron.schedule).toHaveBeenCalledWith('*/30 * * * *', expect.any(Function));
    expect(loggerService.info).toHaveBeenCalledWith('cron.initialized', 'Background jobs initialized.');
  });
});
