import { RepoService } from './repo.service';
import { KeyRouterService } from './keyRouter.service';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { buildChatPrompt } from '../utils/chatPromptBuilder';
import { decrypt } from '../utils/encryption';
import { getPrisma } from '../db';
import { recordDailyGeneration } from '../utils/dailyStats';

export class ChatService {
  private repoService: RepoService;
  private keyRouter: KeyRouterService;

  private dbUrl: string;

  constructor(dbUrl: string) {
    this.dbUrl = dbUrl;
    this.repoService = new RepoService();
    this.keyRouter = new KeyRouterService(this.dbUrl);
  }

  async analyzeRepository(repoUrl: string, userId?: string) {
    if (userId) {
      const prisma = getPrisma(this.dbUrl);
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.githubAccessToken || user?.installationId) {
        const repoService = new RepoService({
          token: user.githubAccessToken ? decrypt(user.githubAccessToken) : undefined,
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
      const prisma = getPrisma(this.dbUrl);
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.githubAccessToken || user?.installationId) {
        contextRepoService = new RepoService({
          token: user.githubAccessToken ? decrypt(user.githubAccessToken) : undefined,
          installationId: user.installationId || undefined,
        });
        bypassCache = true;
      }
    }
    const repoContext = await contextRepoService.analyzeRepo(repoUrl, { bypassCache });

    // 2. Build The System Prompt
    let systemPrompt = buildChatPrompt({ question, persona, repoContext });

    // 3. Find Available Key For Providers
    const keyInfo = await this.keyRouter.getBestAvailableKey(userId, ['GROQ', 'PROXY_OPENAI', 'GEMINI', 'OPENAI', 'ANTHROPIC', 'DEEPSEEK', 'GROK']);

    if (!keyInfo) {
      throw new Error('No AI Providers Available. Please Add Your Own API Key In Settings To Continue.');
    }

    console.log(
      `[ChatService] Using ${keyInfo.isSystem ? 'System' : 'User'} key for ${keyInfo.provider}`
    );

    let model;
    if (keyInfo.provider.toUpperCase() === 'GEMINI') {
      const google = createGoogleGenerativeAI({ apiKey: keyInfo.key });
      model = google('gemini-3.5-flash');
    } else if (keyInfo.provider.toUpperCase() === 'GROQ') {
      const groq = createGroq({ apiKey: keyInfo.key });
      model = groq('llama-3.3-70b-versatile');
    } else if (keyInfo.provider.toUpperCase() === 'OPENAI') {
      const openai = createOpenAI({ apiKey: keyInfo.key });
      model = openai('gpt-4o-mini');
    } else if (keyInfo.provider.toUpperCase() === 'ANTHROPIC') {
      const anthropic = createAnthropic({ apiKey: keyInfo.key });
      model = anthropic('claude-3-haiku-20240307');
    } else if (keyInfo.provider.toUpperCase() === 'DEEPSEEK') {
      const deepseek = createOpenAI({ apiKey: keyInfo.key, baseURL: 'https://api.deepseek.com/v1' });
      model = deepseek('deepseek-chat');
    } else if (keyInfo.provider.toUpperCase() === 'GROK') {
      const grok = createOpenAI({ apiKey: keyInfo.key, baseURL: 'https://api.x.ai/v1' });
      model = grok('grok-beta');
    } else if (keyInfo.provider.toUpperCase() === 'PROXY_OPENAI') {
      const proxyOpenai = createOpenAI({ apiKey: keyInfo.key, baseURL: 'https://api.chatanywhere.tech' });
      model = proxyOpenai('gpt-4o-mini');
      systemPrompt += '\n\nIMPORTANT: You MUST provide extremely verbose, comprehensive, and detailed output. Follow the exact prompt strictly and deliver high-quality rich content.';
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
          const prisma = getPrisma(this.dbUrl);
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
            await recordDailyGeneration(this.dbUrl, userId);
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


