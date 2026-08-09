import type { Mock } from "vitest";
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

vi.mock('../../../src/services/repo.service');
vi.mock('../../../src/services/keyRouter.service');
vi.mock('ai');
vi.mock('@ai-sdk/google');
vi.mock('@ai-sdk/groq');
vi.mock('../../../src/utils/chatPromptBuilder');
vi.mock('../../../src/utils/encryption');
vi.mock('../../../src/utils/dailyStats');
vi.mock('../../../src/db', () => {
  const prismaObj = {
    user: {
      findUnique: vi.fn(),
    },
    chatMessage: {
      createMany: vi.fn(),
    },
    chatAnalytics: {
      create: vi.fn(),
    },
    $executeRaw: vi.fn(),
  };
  return {
    __esModule: true,
    default: prismaObj,
    getPrisma: vi.fn().mockReturnValue(prismaObj),
  };
});

describe('ChatService', () => {
  let chatService: ChatService;

  beforeEach(() => {
    vi.clearAllMocks();
    chatService = new ChatService('mock-db-url');
  });

  describe('analyzeRepository', () => {
    it('should just call repoService when no user is provided', async () => {
      const mockResult = { name: 'test' };
      (RepoService.prototype.analyzeRepo as Mock).mockResolvedValue(mockResult);

      const result = await chatService.analyzeRepository('https://github.com/foo/bar');
      expect(result).toBe(mockResult);
      expect(RepoService.prototype.analyzeRepo).toHaveBeenCalledWith('https://github.com/foo/bar');
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should bypass cache with unencrypted token if user has github access token', async () => {
      const mockUser = { githubAccessToken: 'encrypted_token', installationId: 'inst_123' };
      (prisma.user.findUnique as Mock).mockResolvedValue(mockUser);
      (decrypt as Mock).mockReturnValue('decrypted_token');
      (RepoService.prototype.analyzeRepo as Mock).mockResolvedValue({ name: 'test-private' });

      await chatService.analyzeRepository('https://github.com/foo/bar', 'user-1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(decrypt).toHaveBeenCalledWith('encrypted_token');
      expect(RepoService).toHaveBeenCalledWith({ token: 'decrypted_token', installationId: 'inst_123' });
      expect(RepoService.prototype.analyzeRepo).toHaveBeenCalledWith('https://github.com/foo/bar', { bypassCache: true });
    });
  });

  describe('generateChatStream', () => {
    it('should throw an error if no API keys are available', async () => {
      (KeyRouterService.prototype.getBestAvailableKey as Mock).mockResolvedValue(null);
      (RepoService.prototype.analyzeRepo as Mock).mockResolvedValue({});

      await expect(
        chatService.generateChatStream('https://repo', 'hi', 'dev', [], 'session-1')
      ).rejects.toThrow('No AI Providers Available');
    });

    it('should invoke streamText with GEMINI correctly', async () => {
      const mockKeyInfo = { provider: 'GEMINI', key: 'gemini-key', isSystem: true };
      const mockModel = vi.fn();
      
      (KeyRouterService.prototype.getBestAvailableKey as Mock).mockResolvedValue(mockKeyInfo);
      (RepoService.prototype.analyzeRepo as Mock).mockResolvedValue({ name: 'test' });
      (buildChatPrompt as Mock).mockReturnValue('You are a dev.');
      (createGoogleGenerativeAI as Mock).mockReturnValue(() => mockModel);
      (streamText as Mock).mockReturnValue({ asyncIterator: vi.fn() });

      const result = await chatService.generateChatStream('https://repo', 'my question', 'dev', [], 'session-1');

      expect(KeyRouterService.prototype.getBestAvailableKey).toHaveBeenCalledWith(undefined, ['GROQ', 'PROXY_OPENAI', 'GEMINI', 'OPENAI', 'ANTHROPIC', 'DEEPSEEK', 'GROK']);
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
