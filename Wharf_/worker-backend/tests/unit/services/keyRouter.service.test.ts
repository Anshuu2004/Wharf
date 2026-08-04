import type { Mock } from "vitest";
import { KeyRouterService } from '../../../src/services/keyRouter.service';
import prisma from '../../../src/db';
import { decrypt } from '../../../src/utils/encryption';

vi.mock('../../../src/db', () => ({
  __esModule: true,
  default: {
    userApiKey: {
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    systemKey: {
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    }
  }
}));

vi.mock('../../../src/utils/encryption', () => ({
  decrypt: vi.fn()
}));

const mockDecrypt = decrypt as Mock;

describe('KeyRouterService', () => {
  let keyRouter: KeyRouterService;

  beforeEach(() => {
    vi.clearAllMocks();
    keyRouter = new KeyRouterService();
  });

  describe('getUserKey', () => {
    it('should return null if user has no valid key', async () => {
      (prisma.userApiKey.findFirst as Mock).mockResolvedValue(null);
      const res = await keyRouter.getUserKey('GEMINI', 'u-1');
      expect(res).toBeNull();
    });

    it('should return decrypted key and increment usage for valid userkey', async () => {
      const mockDbKey = { id: 'k-1', key: 'encrypted', provider: 'GEMINI' };
      (prisma.userApiKey.findFirst as Mock).mockResolvedValue(mockDbKey);
      mockDecrypt.mockReturnValue('decrypted-real-key');

      const res = await keyRouter.getUserKey('GEMINI', 'u-1');
      expect(res).toEqual({
        id: 'k-1',
        key: 'decrypted-real-key',
        provider: 'GEMINI',
        isSystem: false
      });
      expect(prisma.userApiKey.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'k-1' } })
      );
    });
  });

  describe('getSystemKey', () => {
    it('should fallback to system key successfully', async () => {
      const mockSysKey = { id: 's-1', key: 'sys-enc', provider: 'ANTHROPIC' };
      (prisma.systemKey.findFirst as Mock).mockResolvedValue(mockSysKey);
      mockDecrypt.mockReturnValue('sys-clear');

      const res = await keyRouter.getSystemKey('ANTHROPIC');
      expect(res).toEqual({ id: 's-1', key: 'sys-clear', provider: 'ANTHROPIC', isSystem: true });
    });
  });

  describe('getAvailableKey', () => {
    it('should use system key if userId is undefined', async () => {
      const sysKey = { id: 's-1', key: 'sys', provider: 'G', isSystem: true };
      vi.spyOn(keyRouter, 'getSystemKey').mockResolvedValue(sysKey);
      vi.spyOn(keyRouter, 'getUserKey');

      const res = await keyRouter.getAvailableKey('GEMINI');
      expect(res).toBe(sysKey);
      expect(keyRouter.getUserKey).not.toHaveBeenCalled();
    });

    it('should use user key if available, skipping system key fallback', async () => {
      const uKey = { id: 'u-1', key: 'uu', provider: 'G', isSystem: false };
      vi.spyOn(keyRouter, 'getUserKey').mockResolvedValue(uKey);
      vi.spyOn(keyRouter, 'getSystemKey').mockResolvedValue(null);

      const res = await keyRouter.getAvailableKey('GEMINI', 'user-123');
      expect(res).toBe(uKey);
      expect(keyRouter.getSystemKey).not.toHaveBeenCalled();
    });
  });

  describe('markAsExhausted', () => {
    it('should update system key correctly', async () => {
      await keyRouter.markAsExhausted('sys-123', true);
      expect(prisma.systemKey.update).toHaveBeenCalledWith({
        where: { id: 'sys-123' }, data: { isExhausted: true }
      });
    });

    it('should update user key correctly', async () => {
      await keyRouter.markAsExhausted('usr-123', false);
      expect(prisma.userApiKey.update).toHaveBeenCalledWith({
        where: { id: 'usr-123' }, data: { isExhausted: true }
      });
    });
  });

  describe('resetAllExhaustedKeys', () => {
    it('should call updateMany on both tables', async () => {
      await keyRouter.resetAllExhaustedKeys();
      expect(prisma.systemKey.updateMany).toHaveBeenCalled();
      expect(prisma.userApiKey.updateMany).toHaveBeenCalled();
    });
  });
});
