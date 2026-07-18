import { RepoService } from './repo.service';
import { KeyRouterService } from './keyRouter.service';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { buildChatPrompt } from '../utils/chatPromptBuilder';
import { decrypt } from '../utils/encryption';
import prisma from '../db';
import { recordDailyGeneration } from '../utils/dailyStats';

export class ChatService {
  private repoService: RepoService;
  private keyRouter: KeyRouterService;

  constructor() {
    this.repoService = new RepoService();
    this.keyRouter = new KeyRouterService();
  }

  async analyzeRepository(repoUrl: string, userId?: string) {
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.githubAccessToken) {
        const repoService = new RepoService({
          token: decrypt(user.githubAccessToken),
          installationId: user.installationId || undefined,
        });
        // Always Bypass Cache When Authenticated — Private Repo
        // Even If A Stale Unauthenticated Cache Entry Exists
        return repoService.analyzeRepo(repoUrl, { bypassCache: true });
      }
    }
    return this.repoService.analyzeRepo(repoUrl);
  }

  async generateChatStream(
    repoUrl: string,
    question: string,
    persona: string,
    history: any[],
    sessionId: string,
    userId?: string
  ) {
    // 1. Get Repository Metadata Context
    let contextRepoService = this.repoService;
    let bypassCache = false;
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.githubAccessToken) {
        contextRepoService = new RepoService({
          token: decrypt(user.githubAccessToken),
          installationId: user.installationId || undefined,
        });
        bypassCache = true;
      }
    }
    const repoContext = await contextRepoService.analyzeRepo(repoUrl, { bypassCache });

    // 2. Build The System Prompt
    const systemPrompt = buildChatPrompt({ question, persona, repoContext });

    // 3. Find Available Key For Providers
    const preferredProviders = ['GEMINI', 'GROQ'];
    let keyInfo = null;

    for (const provider of preferredProviders) {
      keyInfo = await this.keyRouter.getAvailableKey(provider, userId);
      if (keyInfo) break;
    }

    if (!keyInfo) {
      throw new Error('No API keys available for AI chat generation.');
    }

    console.log(
      `[ChatService] Using ${keyInfo.isSystem ? 'System' : 'User'} key for ${keyInfo.provider}`
    );

    let model;
    if (keyInfo.provider.toUpperCase() === 'GEMINI') {
      const google = createGoogleGenerativeAI({ apiKey: keyInfo.key });
      model = google('gemini-2.5-flash');
    } else if (keyInfo.provider.toUpperCase() === 'GROQ') {
      const groq = createGroq({ apiKey: keyInfo.key });
      model = groq('llama-3.1-8b-instant');
    } else {
      throw new Error('Unsupported provider for chat.');
    }

    // Append The Question To History So Vercel SDK Handles It
    const messages = [...history, { role: 'user', content: question }];

    // 4. Generate Stream With Vercel AI SDK
    const result = streamText({
      model,
      system: systemPrompt,
      messages,
      onFinish: async (completion) => {
        try {
          // Save The User Message + Assistant Answer To The Database
          await prisma.chatMessage.createMany({
            data: [
              {
                sessionId,
                role: 'user',
                content: question,
              },
              {
                sessionId,
                role: 'assistant',
                content: completion.text,
                tokens: completion.usage?.totalTokens || 0,
              },
            ],
          });

          // Also Save Chat Analytics
          await prisma.chatAnalytics.create({
            data: {
              sessionId,
              totalTokens: completion.usage?.totalTokens || 0,
              totalMessages: 2,
              avgResponseTime: 0,
            },
          });

          if (userId && completion.usage?.totalTokens) {
            // Permanently Bank These Tokens
            const chatTokens = completion.usage.totalTokens;
            await prisma.$executeRaw`UPDATE "User" SET "lifetimeTokens" = "lifetimeTokens" + ${chatTokens}, "lifetimeChats" = "lifetimeChats" + 1 WHERE id = ${userId}`;
            await recordDailyGeneration(userId);
          }
        } catch (dbError) {
          console.error('[ChatService] Error saving message or analytics to DB:', dbError);
        }
      },
    });

    // Return The Result Directly Rather Than toDataStreamResponse
    return result;
  }
}

export const chatService = new ChatService();
