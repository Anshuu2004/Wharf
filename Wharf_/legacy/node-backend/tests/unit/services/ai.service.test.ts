import { AiService } from '../../../src/services/ai.service';
import { KeyRouterService } from '../../../src/services/keyRouter.service';
import { GoogleGenAI } from '@google/genai';

jest.mock('../../../src/services/keyRouter.service');
jest.mock('../../../src/utils/logger', () => ({
  loggerService: {
    stepStart: jest.fn(),
    stepEnd: jest.fn(),
    providerSelected: jest.fn(),
    providerStarted: jest.fn(),
    providerCompleted: jest.fn(),
    providerFallback: jest.fn(),
    providerFailed: jest.fn(),
  }
}));

// We Only Need To Deeply Test One Provider Fallback Path To Prove The Logic
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContentStream: jest.fn().mockResolvedValue([
        { text: 'chunk1' }, { text: 'chunk2' }
      ])
    }
  }))
}));

describe('AiService', () => {
  let aiService: AiService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    aiService = new AiService();
  });

  describe('generateReadmeStream', () => {
    it('should throw if no keys exist at all', async () => {
      (KeyRouterService.prototype.getBestAvailableKey as jest.Mock).mockResolvedValue(null);
      
      await expect(
        aiService.generateReadmeStream({} as any, 'technical', [])
      ).rejects.toThrow('No API Keys Available');
    });

    it('should use system GEMINI key if user has no keys', async () => {
      (KeyRouterService.prototype.getBestAvailableKey as jest.Mock).mockResolvedValue(
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
      expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: 'sys-gem' });
    });

    it('should fallback to NEXT_AVAILABLE if exhaustion error occurs', async () => {
      (KeyRouterService.prototype.getBestAvailableKey as jest.Mock)
        .mockResolvedValueOnce({ id: 's1', key: 'sys-fail', provider: 'GEMINI', isSystem: true })
        .mockResolvedValueOnce({ id: 's2', key: 'sys-win', provider: 'GEMINI', isSystem: true });

      // First Gen Fails With 429
      const mockFailModel = { generateContentStream: jest.fn().mockRejectedValue({ status: 429 }) };
      const mockWinModel = { generateContentStream: jest.fn().mockResolvedValue([{ text: 'win' }]) };

      (GoogleGenAI as jest.Mock)
        .mockImplementationOnce(() => ({ models: mockFailModel }))
        .mockImplementationOnce(() => ({ models: mockWinModel }));

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
