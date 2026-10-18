import { recordDailyGeneration } from '../../../src/utils/dailyStats';
import prisma from '../../../src/db';
import { describe, expect, test, jest, beforeEach } from '@jest/globals';

jest.mock('../../../src/db', () => ({
  __esModule: true,
  default: {
    $executeRaw: jest.fn()
  }
}));

describe('dailyStats Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should execute raw sql upsert without throwing errors', async () => {
    (prisma.$executeRaw as unknown as jest.Mock<any>).mockResolvedValue(1);

    await expect(recordDailyGeneration('user-1')).resolves.not.toThrow();

    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  test('should execute successfully even if userId is not provided', async () => {
    (prisma.$executeRaw as unknown as jest.Mock<any>).mockResolvedValue(1);

    await expect(recordDailyGeneration()).resolves.not.toThrow();

    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  test('should catch and log errors gracefully without blocking execution', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (prisma.$executeRaw as unknown as jest.Mock<any>).mockRejectedValue(new Error('DB failure'));

    await expect(recordDailyGeneration('user-1')).resolves.not.toThrow();
    
    expect(errorSpy).toHaveBeenCalledWith('[DailyStats] Failed To Record Daily Generation:', expect.any(Error));
    errorSpy.mockRestore();
  });
});
