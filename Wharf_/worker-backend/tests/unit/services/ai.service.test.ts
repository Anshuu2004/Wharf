import type { Mock } from "vitest";
import { AiService } from '../../../src/services/ai.service';
import { KeyRouterService } from '../../../src/services/keyRouter.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

vi.mock('../../../src/services/keyRouter.service');
vi.mock('../../../src/db', () => ({
  __esModule: true,
  default: {},
  getPrisma: vi.fn().mockReturnValue({})
}));
vi.mock('../../../src/utils/logger', () => ({
  loggerService: {
    stepStart: vi.fn(),
    stepEnd: vi.fn(),
    providerSelected: vi.fn(),
    providerStarted: vi.fn(),
    providerCompleted: vi.fn(),
    providerFallback: vi.fn(),
    providerFailed: vi.fn(),
  }
}));

// We Only Need To Deeply Test One Provider Fallback Path To Prove The Logic
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(function() {
    return {
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContentStream: vi.fn().mockResolvedValue({
          stream: [{ text: () => 'chunk1' }, { text: () => 'chunk2' }]
        })
      })
    };
  })
}));

describe('AiService', () => {
  let aiService: AiService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    aiService = new AiService('postgres://test');
  });

  describe('generateReadmeStream', () => {
    it('should throw if no keys exist at all', async () => {
      (KeyRouterService.prototype.getBestAvailableKey as Mock).mockResolvedValue(null);
      
      await expect(
        aiService.generateReadmeStream({} as any, 'technical', [])
      ).rejects.toThrow('No API keys available');
    });

    it('should use system GEMINI key if user has no keys', async () => {
      (KeyRouterService.prototype.getBestAvailableKey as Mock).mockResolvedValue(
        { id: 's1', key: 'sys-gem', provider: 'GEMINI', isSystem: true }
      );

      const mockContext = { 
        meta: { name: 'repo', owner: 'owner', description: 'desc', language: 'ts', topics: [], stars: 10, license: 'MIT', defaultBranch: 'main' },
        frameworks: [],
        commands: { install: '', run: '' },
        treePreview: '',
        keyFiles: {}
      };

      let chunks = '';
      const result = await aiService.generateReadmeStream(mockContext as any, 'technical', [], 'user-1', (t) => {
        chunks += t;
      });

      expect(result.provider).toBe('GEMINI');
      expect(result.text).toBe('chunk1chunk2');
      expect(chunks).toBe('chunk1chunk2');
      expect(GoogleGenerativeAI).toHaveBeenCalledWith('sys-gem');
    });

    it('should fallback to NEXT_AVAILABLE if exhaustion error occurs', async () => {
      (KeyRouterService.prototype.getBestAvailableKey as Mock)
        .mockResolvedValueOnce({ id: 's1', key: 'sys-fail', provider: 'GEMINI', isSystem: true })
        .mockResolvedValueOnce({ id: 's2', key: 'sys-win', provider: 'GEMINI', isSystem: true });

      // First Gen Fails With 429
      const mockFailModel = { generateContentStream: vi.fn().mockRejectedValue({ status: 429 }) };
      const mockWinModel = { generateContentStream: vi.fn().mockResolvedValue({ stream: [{ text: () => 'win' }] }) };

      (GoogleGenerativeAI as Mock)
        .mockImplementationOnce(function() { return { getGenerativeModel: () => mockFailModel }; })
        .mockImplementationOnce(function() { return { getGenerativeModel: () => mockWinModel }; });

      const mockContext = { 
        meta: { name: 'repo', owner: 'owner', description: 'desc', language: 'ts', topics: [], stars: 10, license: 'MIT', defaultBranch: 'main' },
        frameworks: [],
        commands: { install: '', run: '' },
        treePreview: '',
        keyFiles: {}
      };
      const result = await aiService.generateReadmeStream(mockContext as any, 'technical', []);
      expect(result.text).toBe('win');
      
      // Verified Exhaustion Mark
      expect(KeyRouterService.prototype.markAsExhausted).toHaveBeenCalledWith('s1', true);
    });
  });
});
