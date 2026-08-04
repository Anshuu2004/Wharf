import type { Mock } from "vitest";
import { APIKeyService } from '../../../src/services/apiKey.service';
import prisma from '../../../src/db';

vi.mock('../../../src/db', () => ({
  __esModule: true,
  default: {
    userApiKey: {
      upsert: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../../../src/utils/encryption', () => ({
  encrypt: vi.fn((key) => `encrypted_${key}`),
  decrypt: vi.fn((key) => key.replace('encrypted_', '')),
}));

global.fetch = vi.fn() as Mock;

describe('APIKeyService', () => {
  let apiKeyService: APIKeyService;

  beforeEach(() => {
    vi.clearAllMocks();
    apiKeyService = new APIKeyService();
  });

  describe('addKey', () => {
    it('should add a valid OpenAI key successfully', async () => {
      const mockKey = 'sk-12345';
      const mockUserId = 'user-1';

      // Mock Valid Verification
      (global.fetch as Mock).mockResolvedValue({
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      });

      const expectedEntity = {
        id: 'key-1',
        userId: mockUserId,
        key: `encrypted_${mockKey}`,
        provider: 'OPENAI',
      };

      (prisma.userApiKey.upsert as Mock).mockResolvedValue(expectedEntity);

      const result = await apiKeyService.addKey(mockUserId, {
        key: mockKey,
        provider: 'openai',
      });

      expect(global.fetch).toHaveBeenCalledWith('https://api.openai.com/v1/models', expect.any(Object));
      expect(prisma.userApiKey.upsert).toHaveBeenCalledWith(expect.objectContaining({
        create: expect.objectContaining({ provider: 'OPENAI', key: `encrypted_${mockKey}` })
      }));
      expect(result).toEqual(expectedEntity);
    });

    it('should reject invalid keys', async () => {
      (global.fetch as Mock).mockResolvedValue({
        status: 401,
      });

      await expect(apiKeyService.addKey('user-1', {
        key: 'invalid-key',
        provider: 'openai'
      })).rejects.toThrow('Invalid API key: Invalid API key');

      expect(prisma.userApiKey.upsert).not.toHaveBeenCalled();
    });
  });

  describe('getValidKey', () => {
    it('should return null if no key is available', async () => {
      (prisma.userApiKey.findFirst as Mock).mockResolvedValue(null);

      const result = await apiKeyService.getValidKey('user-1', 'OPENAI');
      expect(result).toBeNull();
    });

    it('should return a decrypted key and increment usage', async () => {
      const mockEntity = {
        id: 'key-1',
        key: 'encrypted_sk-123',
      };

      (prisma.userApiKey.findFirst as Mock).mockResolvedValue(mockEntity);

      const result = await apiKeyService.getValidKey('user-1', 'OPENAI');
      
      expect(prisma.userApiKey.update).toHaveBeenCalledWith({
        where: { id: mockEntity.id },
        data: expect.objectContaining({ usageCount: { increment: 1 } })
      });
      expect(result).toBe('sk-123');
    });
  });
});
