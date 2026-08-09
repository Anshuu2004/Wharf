import { ChatService } from '../../../src/services/chat.service';
import { RepoService } from '../../../src/services/repo.service';
import { KeyRouterService } from '../../../src/services/keyRouter.service';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { buildChatPrompt } from '../../../src/utils/chatPromptBuilder';
import { decrypt } from '../../../src/utils/encryption';
import { recordDailyGeneration } from '../../../src/utils/dailyStats';
import prisma from '../../../src/db';

jest.mock('../../../src/services/repo.service');
jest.mock('../../../src/services/keyRouter.service');
jest.mock('ai');
jest.mock('@ai-sdk/google');
jest.mock('@ai-sdk/groq');
jest.mock('../../../src/utils/chatPromptBuilder');
jest.mock('../../../src/utils/encryption');
jest.mock('../../../src/utils/dailyStats');
jest.mock('../../../src/db', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    chatMessage: {
      createMany: jest.fn(),
    },
    chatAnalytics: {
      create: jest.fn(),
    },
    $executeRaw: jest.fn(),
  },
}));

describe('ChatService', () => {
  let chatService: ChatService;

  beforeEach(() => {
    jest.clearAllMocks();
    chatService = new ChatService();
  });

  describe('analyzeRepository', () => {
    it('should just call repoService when no user is provided', async () => {
      const mockResult = { name: 'test' };
      (RepoService.prototype.analyzeRepo as jest.Mock).mockResolvedValue(mockResult);

      const result = await chatService.analyzeRepository('https://github.com/foo/bar');
      expect(result).toBe(mockResult);
      expect(RepoService.prototype.analyzeRepo).toHaveBeenCalledWith('https://github.com/foo/bar');
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should bypass cache with unencrypted token if user has github access token', async () => {
      const mockUser = { githubAccessToken: 'encrypted_token', installationId: 'inst_123' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (decrypt as jest.Mock).mockReturnValue('decrypted_token');
      (RepoService.prototype.analyzeRepo as jest.Mock).mockResolvedValue({ name: 'test-private' });

      await chatService.analyzeRepository('https://github.com/foo/bar', 'user-1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(decrypt).toHaveBeenCalledWith('encrypted_token');
      expect(RepoService).toHaveBeenCalledWith({ token: 'decrypted_token', installationId: 'inst_123' });
      expect(RepoService.prototype.analyzeRepo).toHaveBeenCalledWith('https://github.com/foo/bar', { bypassCache: true });
    });
  });

  describe('generateChatStream', () => {
    it('should throw an error if no API keys are available', async () => {
      (KeyRouterService.prototype.getAvailableKey as jest.Mock).mockResolvedValue(null);
      (RepoService.prototype.analyzeRepo as jest.Mock).mockResolvedValue({});

      await expect(
        chatService.generateChatStream('https://repo', 'hi', 'dev', [], 'session-1')
      ).rejects.toThrow('No AI providers available. Please add your own API key in Settings to continue.');
    });

    it('should invoke streamText with GEMINI correctly', async () => {
      const mockKeyInfo = { provider: 'GEMINI', key: 'gemini-key', isSystem: true };
      const mockModel = jest.fn();
      
      (KeyRouterService.prototype.getAvailableKey as jest.Mock).mockResolvedValue(mockKeyInfo);
      (RepoService.prototype.analyzeRepo as jest.Mock).mockResolvedValue({ name: 'test' });
      (buildChatPrompt as jest.Mock).mockReturnValue('You are a dev.');
      (createGoogleGenerativeAI as jest.Mock).mockReturnValue(() => mockModel);
      (streamText as jest.Mock).mockReturnValue({ asyncIterator: jest.fn() });

      const result = await chatService.generateChatStream('https://repo', 'my question', 'dev', [], 'session-1');

      expect(KeyRouterService.prototype.getAvailableKey).toHaveBeenCalledWith('GEMINI', undefined);
      expect(createGoogleGenerativeAI).toHaveBeenCalledWith({ apiKey: 'gemini-key' });
      expect(streamText).toHaveBeenCalledWith(expect.objectContaining({
        model: mockModel,
        system: 'You are a dev.',
        messages: [{ role: 'user', content: 'my question' }]
      }));
      expect(result).toBeDefined();
    });
  });
});
