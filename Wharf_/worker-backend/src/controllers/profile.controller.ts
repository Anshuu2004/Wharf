import { Context } from 'hono';
import { streamText } from 'hono/streaming';
import { ProfileService } from '../services/profile.service';
import { AiService } from '../services/ai.service';
import { cacheService } from '../services/cache.service';
import { getPrisma } from '../db';
import { decrypt } from '../utils/encryption';
import { recordDailyGeneration } from '../utils/dailyStats';
import { loggerService, saveRequestLog } from '../utils/logger';
import { Bindings } from '../index';

type AppContext = Context<{ Bindings: Bindings; Variables: { user: any; contextStore: any } }>;

export const getProfile = async (c: AppContext) => {
  const username = c.req.param('username');
  const userContext = c.get('user');
  const userId = userContext?.userId;

  try {
    let token: string | undefined;
    let installationId: string | undefined;

    if (userId) {
      const prisma = getPrisma(c.env.DATABASE_URL);
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { githubAccessToken: true, installationId: true } as any,
      });

      if ((user as any)?.githubAccessToken) {
        token = decrypt((user as any).githubAccessToken as string, c.env.ENCRYPTION_SECRET);
      }
      if ((user as any)?.installationId) {
        installationId = (user as any).installationId;
      }
    }

    const opts: any = { installationId };
    if (token) opts.token = token;
    const profileService = new ProfileService(opts);
    const profileData = await profileService.getProfileData(username!);

    return c.json({ success: true, data: profileData });
  } catch (error: any) {
    return c.json({ success: false, error: error.message || 'Failed to get profile' }, 500);
  }
};

export const generate = async (c: AppContext) => {
  const reqStart = Date.now();
  const body = await c.req.json().catch(() => ({}));
  const { profileData, options } = body;
  const user = c.get('user');
  const userId = user?.userId;

  if (!profileData || !profileData.username || !options) {
    return c.json({ success: false, error: 'profileData and options are required' }, 400);
  }

  const { username } = profileData;
  const { template, theme } = options;

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(options));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const cachedReadme = await cacheService.getProfileReadme(username, template, theme, hash);
    if (cachedReadme) {
      loggerService.cacheHit('profile:' + username);

      await saveRequestLog({
        route: c.req.path,
        method: c.req.method,
        feature: 'PROFILE',
        statusCode: 200,
        cacheHit: true,
        totalDurationMs: Date.now() - reqStart,
      });

      return streamText(c, async (stream) => {
        const chunkSize = 100;
        for (let i = 0; i < cachedReadme.length; i += chunkSize) {
          const chunk = cachedReadme.slice(i, i + chunkSize);
          await stream.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
        await stream.write('data: [DONE]\n\n');
      });
    }

    let generatedMarkdown;
    let fallbackProviderStr;
    const prisma = getPrisma(c.env.DATABASE_URL);

    return streamText(c, async (stream) => {
      if (template === 'terminal') {
        const { generateTerminalReadmeDocs } = require('../utils/terminalTemplate');
        generatedMarkdown = generateTerminalReadmeDocs(
          username,
          options.birthday,
          options.terminalConfig,
          profileData.avatarUrl
        );
        fallbackProviderStr = 'terminal-static';
        const chunkSize = 100;
        for (let i = 0; i < generatedMarkdown.length; i += chunkSize) {
          const chunk = generatedMarkdown.slice(i, i + chunkSize);
          await stream.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
          await new Promise((resolve) => setTimeout(resolve, 5));
        }
      } else {
        const aiService = new AiService(c.env.DATABASE_URL);
        const result = await aiService.generateProfileStream(
          profileData,
          options,
          userId,
          async (chunk) => {
            await stream.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
          }
        );
        generatedMarkdown = result.text;
        fallbackProviderStr = result.provider;
      }

      c.executionCtx.waitUntil((async () => {
        await cacheService.setProfileReadme(username, template, theme, hash, generatedMarkdown);

        if (userId) {
          try {
            const wordCount = generatedMarkdown.split(/\s+/).filter(Boolean).length;
            const record = await prisma.profileReadme.create({
              data: {
                userId,
                appUsername: c.get('contextStore')?.username || 'unknown',
                username,
                content: generatedMarkdown,
                wordCount,
                template,
                theme,
                badges: options.githubBadges || [],
                showStats: options.showStats ?? true,
                showTopLanguages: options.showTopLanguages ?? true,
                showContributions: options.showContributions ?? true,
              },
            });

            const tokensGenerated = Math.round(wordCount * 1.37);
            await Promise.all([
              prisma.$executeRaw`UPDATE "User" SET "lifetimeTokens" = "lifetimeTokens" + ${tokensGenerated}, "lifetimeProfiles" = "lifetimeProfiles" + 1 WHERE id = ${userId}`,
              recordDailyGeneration(c.env.DATABASE_URL, userId),
            ]);
          } catch (dbError: any) {
            loggerService.error('database.save.error', '[CRITICAL DB ERROR] Failed to save profile generation to DB', dbError);
          }
        }
      })());

      await stream.write('data: [DONE]\n\n');
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message || 'Failed to generate Profile README' }, 500);
  }
};

export const getHistory = async (c: AppContext) => {
  const user = c.get('user');
  const userId = user?.userId;
  const page = parseInt(c.req.query('page') || '1');
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 200);
  const skip = (page - 1) * limit;

  if (!userId) {
    return c.json({ success: false, error: 'Authentication required' }, 401);
  }

  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const history = await prisma.profileReadme.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { generatedAt: 'desc' },
    });

    return c.json({ success: true, data: history });
  } catch (error: any) {
    return c.json({ success: false, error: 'Failed to fetch history' }, 500);
  }
};

export const getStats = async (c: AppContext) => {
  const user = c.get('user');
  const userId = user?.userId;

  if (!userId) return c.json({ success: false, error: 'Authentication required' }, 401);

  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const history = await prisma.profileReadme.findMany({
      where: { userId },
      select: { username: true, template: true, generatedAt: true },
    });

    if (!history || history.length === 0) {
      return c.json({
        success: true,
        data: {
          totalProfiles: 0,
          readmesGenerated: 0,
          totalStars: 0,
          templatesUsed: 0,
          topTemplate: '--',
          lastGenerated: '--',
        },
      });
    }

    const readmesGenerated = history.length;
    const uniqueProfiles = new Set(history.map((h) => h.username)).size;
    const templateCounts: Record<string, number> = {};
    history.forEach((h) => {
      templateCounts[h.template] = (templateCounts[h.template] || 0) + 1;
    });
    const templatesUsed = Object.keys(templateCounts).length;
    const topTemplate = Object.keys(templateCounts).reduce((a, b) =>
      templateCounts[a] > templateCounts[b] ? a : b
    );

    const sortedDates = history.map((h) => new Date(h.generatedAt).getTime()).sort((a, b) => b - a);
    const lastGenerated = new Date(sortedDates[0]).toLocaleDateString();

    return c.json({
      success: true,
      data: { totalProfiles: uniqueProfiles, readmesGenerated, totalStars: 0, templatesUsed, topTemplate, lastGenerated },
    });
  } catch (error: any) {
    return c.json({ success: false, error: 'Failed to fetch stats' }, 500);
  }
};

export const deleteProfileItem = async (c: AppContext) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const userId = user?.userId;

  if (!userId) return c.json({ success: false, error: 'Authentication required' }, 401);

  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const record = await prisma.profileReadme.findUnique({
      where: { id },
    });

    if (!record || record.userId !== userId) {
      return c.json({ success: false, error: 'Record not found' }, 404);
    }

    const dynamicProfiles = await prisma.profileReadme.count({ where: { userId } });
    await prisma.$executeRaw`UPDATE "User" SET "lifetimeProfiles" = GREATEST("lifetimeProfiles", ${dynamicProfiles}) WHERE id = ${userId}`;

    await prisma.profileReadme.delete({ where: { id } });
    return c.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    return c.json({ success: false, error: 'Failed to delete record' }, 500);
  }
};
