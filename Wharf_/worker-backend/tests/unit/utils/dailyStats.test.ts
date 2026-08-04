import { recordDailyGeneration } from '../../../src/utils/dailyStats';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

const mockPrismaObj = vi.hoisted(() => ({
  $executeRaw: vi.fn(),
}));

vi.mock('../../../src/db', () => ({
  __esModule: true,
  default: mockPrismaObj,
  getPrisma: vi.fn().mockReturnValue(mockPrismaObj),
}));

describe('dailyStats Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mockPrismaObj.$executeRaw as Mock).mockResolvedValue(1);
  });

  test('should execute raw sql upsert without throwing errors', async () => {
    await expect(recordDailyGeneration('mock-db', 'user-1')).resolves.not.toThrow();

    expect(mockPrismaObj.$executeRaw).toHaveBeenCalled();
  });

  test('should execute successfully even if userId is not provided', async () => {
    await expect(recordDailyGeneration('mock-db')).resolves.not.toThrow();

    expect(mockPrismaObj.$executeRaw).toHaveBeenCalled();
  });

  test('should catch and log errors gracefully without blocking execution', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (mockPrismaObj.$executeRaw as Mock).mockRejectedValue(new Error('DB failure'));

    await expect(recordDailyGeneration('mock-db', 'user-1')).resolves.not.toThrow();
    
    expect(errorSpy).toHaveBeenCalledWith('[DailyStats] Failed To Record Daily Generation:', expect.any(Error));
    errorSpy.mockRestore();
  });
});

