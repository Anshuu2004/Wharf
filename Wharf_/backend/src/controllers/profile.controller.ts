import { Request, Response } from 'express';
import { ProfileService } from '../services/profile.service';
import { aiService } from '../services/ai.service';
import { cacheService } from '../services/cache.service';
import prisma from '../db';
import { decrypt } from '../utils/encryption';
import crypto from 'crypto';
import { recordDailyGeneration } from '../utils/dailyStats';
import { loggerService, saveRequestLog } from '../utils/logger';
import { getContextData } from '../utils/asyncContext';

export const getProfile = async (req: Request, res: Response) => {
  const reqStart = Date.now();
  const reqId = String((req as any).id);
  const { username } = req.params;
  const userId = (req as any).user?.userId;

  try {
    let token: string | undefined;
    let installationId: string | undefined;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { githubAccessToken: true, installationId: true } as any,
      });

      if ((user as any)?.githubAccessToken) {
        token = decrypt((user as any).githubAccessToken as string);
      }
      if ((user as any)?.installationId) {
        installationId = (user as any).installationId;
      }
    }

    const profileService = new ProfileService({ token, installationId });
    const profileData = await profileService.getProfileData(username);

    res.json({ success: true, data: profileData });
  } catch (error: any) {
    loggerService.error('github.fetch.error', 'getProfile error', error, { username });
    res.status(500).json({ success: false, error: error.message || 'Failed to get profile' });
  }
};

export const generate = async (req: Request, res: Response) => {
  const reqStart = Date.now();
  const reqId = String((req as any).id);
  const { profileData, options } = req.body;
  const userId = (req as any).user?.userId;

  if (!profileData || !profileData.username || !options) {
    return res.status(400).json({ success: false, error: 'profileData and options are required' });
  }

  const { username } = profileData;
  const { template, theme } = options;

  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify({ profileData, options }))
      .digest('hex');

    const cachedReadme = await cacheService.getProfileReadme(username, template, theme, hash);
    if (cachedReadme) {
      loggerService.cacheHit('profile:' + username);

      await saveRequestLog({
        route: req.baseUrl + req.path,
        method: req.method,
        feature: 'PROFILE',
        statusCode: 200,
        cacheHit: true,
        totalDurationMs: Date.now() - reqStart,
      });

      const chunkSize = 100;
      for (let i = 0; i < cachedReadme.length; i += chunkSize) {
        const chunk = cachedReadme.slice(i, i + chunkSize);
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    let generatedMarkdown;
    let fallbackProviderStr;
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
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
    } else {
      const result = await aiService.generateProfileStream(
        profileData,
        options,
        userId,
        (chunk) => {
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        }
      );
      generatedMarkdown = result.text;
      fallbackProviderStr = result.provider;
    }

    const mdProcStart = loggerService.stepStart();
    await cacheService.setProfileReadme(username, template, theme, hash, generatedMarkdown);

    // Save success metric before possible DB error
    await saveRequestLog({
      route: req.baseUrl + req.path,
      method: req.method,
      statusCode: 200,
      cacheHit: false,
      feature: 'PROFILE',
      finalProvider: fallbackProviderStr,
      targetUsername: username,
      totalDurationMs: Date.now() - reqStart,
    });
    loggerService.stepEnd(
      'markdown.processing.completed',
      'Markdown Processing Completed',
      mdProcStart
    );

    const serialStart = loggerService.stepStart();
    loggerService.info('generation.completed', 'Generated Profile successfully', {
      username,
      durationMs: Date.now() - reqStart,
    });

    if (userId) {
      try {
        const wordCount = generatedMarkdown.split(/\s+/).filter(Boolean).length;
        const dbStart = loggerService.stepStart();
        const { username: appUsername } = getContextData();
        const record = await prisma.profileReadme.create({
          data: {
            userId,
            appUsername,
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
        loggerService.stepEnd('database.save.completed', 'DB Save Completed', dbStart, {
          table: 'ProfileReadme',
          recordId: record.id,
        });

        // Permanently Bank These Tokens — Raw SQL Bypasses Stale Prisma Client Types
        const tokensGenerated = Math.round(wordCount * 1.37);
        await prisma.$executeRaw`UPDATE "User" SET "lifetimeTokens" = "lifetimeTokens" + ${tokensGenerated}, "lifetimeProfiles" = "lifetimeProfiles" + 1 WHERE id = ${userId}`;
        // Record Today's Count In DailyStats So Heatmap/Trend Survive Deletions
        await recordDailyGeneration(userId);

        // Update Stats
        const stats = await prisma.profileStats.findFirst();
        if (stats) {
          await prisma.profileStats.update({
            where: { id: stats.id },
            data: {
              totalProfiles: { increment: 1 },
              totalReadmes: { increment: 1 },
            },
          });
        } else {
          await prisma.profileStats.create({
            data: { totalProfiles: 1, totalReadmes: 1 },
          });
        }
      } catch (dbError: any) {
        loggerService.error(
          'database.save.error',
          '[CRITICAL DB ERROR] Failed to save profile generation to DB',
          dbError
        );
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
    loggerService.stepEnd(
      'response.serialization.completed',
      'Response Serialization Completed',
      serialStart
    );
  } catch (error: any) {
    loggerService.error('generation.error', 'Profile README generation error', error, { username });
    await saveRequestLog({
      route: req.baseUrl + req.path,
      method: req.method,
      feature: 'PROFILE',
      statusCode: 500,
      error: error.message,
      totalDurationMs: Date.now() - reqStart,
    });
    res.write(
      `data: ${JSON.stringify({ error: error.message || 'Failed to generate Profile README' })}\n\n`
    );
    res.end();
  }
};

export const getHistory = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const history = await prisma.profileReadme.findMany({
      where: { userId },
      orderBy: { generatedAt: 'desc' },
    });

    res.json({ success: true, data: history });
  } catch (error: any) {
    loggerService.error('database.fetch.error', 'Failed to fetch profile history', error);
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
};

export const getStats = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const history = await prisma.profileReadme.findMany({
      where: { userId },
      select: { username: true, template: true, generatedAt: true },
    });

    if (!history || history.length === 0) {
      return res.json({
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

    res.json({
      success: true,
      data: {
        totalProfiles: uniqueProfiles,
        readmesGenerated,
        totalStars: 0,
        templatesUsed,
        topTemplate,
        lastGenerated,
      },
    });
  } catch (error: any) {
    loggerService.error('database.fetch.error', 'Failed to fetch stats', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};

export const deleteProfileItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.userId;

  if (!userId) return res.status(401).json({ success: false, error: 'Authentication required' });

  try {
    const record = await prisma.profileReadme.findUnique({
      where: { id },
    });

    if (!record || record.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }

    // High-Water Mark Prerequisite Sync
    const dynamicProfiles = await prisma.profileReadme.count({ where: { userId } });
    await prisma.$executeRaw`UPDATE "User" SET "lifetimeProfiles" = GREATEST("lifetimeProfiles", ${dynamicProfiles}) WHERE id = ${userId}`;

    await prisma.profileReadme.delete({ where: { id } });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    loggerService.error('database.delete.error', 'Failed to delete profile history', error, {
      paramId: id,
    });
    res.status(500).json({ success: false, error: 'Failed to delete record' });
  }
};
