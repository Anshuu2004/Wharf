import { Request, Response } from 'express';
import { RepoService } from '../services/repo.service';
import { aiService } from '../services/ai.service';
import { cacheService } from '../services/cache.service';
import { parseGithubUrl } from '../utils/parseGithubUrl';
import { decrypt } from '../utils/encryption';
import prisma from '../db';
import { recordDailyGeneration } from '../utils/dailyStats';
import { loggerService, saveRequestLog } from '../utils/logger';

export const generateReadme = async (req: Request, res: Response) => {
  const reqStart = Date.now();
  const reqId = String((req as any).id);
  const { repoUrl, tone, sections } = req.body;
  const userId = (req as any).user?.userId;

  if (!repoUrl || !tone || !sections || !Array.isArray(sections)) {
    return res
      .status(400)
      .json({ success: false, error: 'repoUrl, tone, and sections are required fields' });
  }

  const parsed = parseGithubUrl(repoUrl);
  if (!parsed) {
    return res.status(400).json({ success: false, error: 'Invalid GitHub URL' });
  }

  const { owner, repo } = parsed;

  try {
    // Set SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Check Redis Cache First
    const cacheStart = loggerService.stepStart();
    const cachedReadme = await cacheService.getReadme(owner, repo, tone, sections);
    loggerService.stepEnd('cache.lookup.completed', 'Cache Lookup Completed', cacheStart, {
      repository: `${owner}/${repo}`,
    });
    if (cachedReadme) {
      loggerService.cacheHit(`${owner}/${repo}`);
      await saveRequestLog({
        route: req.baseUrl + req.path,
        method: req.method,
        feature: 'README',
        statusCode: 200,
        cacheHit: true,
        totalDurationMs: Date.now() - reqStart,
      });
      const chunkSize = 100;
      for (let i = 0; i < cachedReadme.length; i += chunkSize) {
        const chunk = cachedReadme.slice(i, i + chunkSize);
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 10)); // Short Delay For Smooth UI Stream
      }
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    // Cache Miss: Proceed With Fetching Repository Analysis
    let token: string | undefined;
    let installationId: string | undefined;

    let encryptedToken = (req as any).user?.githubAccessToken;

    if (userId) {
      if (encryptedToken) {
        token = decrypt(encryptedToken);
      } else {
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              githubAccessToken: true,
              installationId: true,
            },
          });

          if (typeof user?.githubAccessToken === 'string') {
            token = decrypt(user.githubAccessToken);
          }

          if (user?.installationId) {
            installationId = user.installationId;
          }
        } catch (dbErr: any) {
          loggerService.warn(
            'database.read.error',
            'Failed to read user from DB in generate.controller',
            dbErr
          );
        }
      }
    }

    const repoService = new RepoService({ token, installationId });
    const githubStart = loggerService.stepStart();
    const repoContext = await repoService.analyzeRepo(repoUrl);
    loggerService.stepEnd('github.fetch.completed', 'GitHub Fetch Completed', githubStart, {
      repository: `${owner}/${repo}`,
    });

    // Call AIService & Stream Back To User
    const aiStart = loggerService.stepStart();
    const { text: generatedMarkdown, provider } = await aiService.generateReadmeStream(
      repoContext,
      tone,
      sections,
      userId,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
    );
    loggerService.stepEnd('generation.ai.completed', 'AI Generation Completed', aiStart, {
      repository: `${owner}/${repo}`,
      provider,
    });

    const mdProcStart = loggerService.stepStart();
    // Store In Cache - Pass Sections As Array
    await cacheService.setReadme(owner, repo, tone, sections, generatedMarkdown);

    // Save To Database Repository List If User Is Logged In
    if (userId) {
      const dbStart = loggerService.stepStart();
      try {
        const repository = await prisma.repository.upsert({
          where: { owner_name_userId: { owner, name: repo, userId } },
          update: {
            description: repoContext.meta.description,
            stars: repoContext.meta.stars,
            language: repoContext.meta.language,
          },
          create: {
            owner,
            name: repo,
            userId,
            url: repoUrl,
            description: repoContext.meta.description,
            stars: repoContext.meta.stars,
            language: repoContext.meta.language,
          },
        });

        const wordCount = generatedMarkdown.split(/\s+/).filter(Boolean).length;
        const tokensGenerated = Math.round(wordCount * 1.37);

        const genRecord = await prisma.generation.create({
          data: {
            type: 'README',
            content: generatedMarkdown,
            wordCount,
            options: { tone, sections },
            repoId: repository.id,
          },
        });
        loggerService.stepEnd('database.save.completed', 'DB Save Completed', dbStart, {
          table: 'Generation',
          recordId: genRecord.id,
        });

        // Permanently Bank These Tokens — Raw SQL Bypasses Stale Prisma Client Types
        await Promise.all([
          prisma.$executeRaw`UPDATE "User" SET "lifetimeTokens" = "lifetimeTokens" + ${tokensGenerated}, "lifetimeReadmes" = "lifetimeReadmes" + 1 WHERE id = ${userId}`,
          // Record today's count in DailyStats so heatmap/trend survive deletions
          recordDailyGeneration(userId)
        ]);
      } catch (dbError) {
        loggerService.error('database.save.error', 'Failed to save generation to DB', dbError);
      }
    }

    loggerService.stepEnd(
      'markdown.processing.completed',
      'Markdown Processing Completed',
      mdProcStart
    );

    const serialStart = loggerService.stepStart();
    loggerService.info('generation.completed', 'README generated successfully', {
      repository: `${owner}/${repo}`,
      cache: 'MISS',
      durationMs: Date.now() - reqStart,
    });
    await saveRequestLog({
      route: req.baseUrl + req.path,
      method: req.method,
      feature: 'README',
      statusCode: 200,
      cacheHit: false,
      finalProvider: provider,
      targetRepo: `${owner}/${repo}`,
      totalDurationMs: Date.now() - reqStart,
    });

    res.write('data: [DONE]\n\n');
    res.end();
    loggerService.stepEnd(
      'response.serialization.completed',
      'Response Serialization Completed',
      serialStart
    );
  } catch (error: any) {
    loggerService.error('generation.error', 'README generation error', error, {
      repository: `${owner}/${repo}`,
    });
    await saveRequestLog({
      route: req.baseUrl + req.path,
      method: req.method,
      feature: 'README',
      statusCode: 500,
      error: error.message,
      totalDurationMs: Date.now() - reqStart,
    });
    res.write(
      `data: ${JSON.stringify({ error: error.message || 'Failed to generate README' })}\n\n`
    );
    res.end();
  }
};

export const getHistory = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const skip = (page - 1) * limit;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const history = await prisma.generation.findMany({
      where: {
        repository: {
          userId,
        },
      },
      skip,
      take: limit,
      select: {
        id: true,
        type: true,
        wordCount: true,
        createdAt: true,
        repository: {
          select: {
            owner: true,
            name: true,
            url: true,
            language: true,
            stars: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ success: true, data: history });
  } catch (error: any) {
    loggerService.error('database.fetch.error', 'Failed to fetch generation history', error);
    res.status(500).json({ success: false, error: 'Failed to fetch generation history' });
  }
};

export const getHistoryById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.userId;

  if (!userId) return res.status(401).json({ success: false, error: 'Authentication required' });

  try {
    const record = await prisma.generation.findUnique({
      where: { id },
      include: {
        repository: true,
      },
    });

    if (!record || record.repository.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }

    res.json({ success: true, data: record });
  } catch (error: any) {
    loggerService.error('database.fetch.error', 'Failed to fetch generation by ID', error, {
      paramId: id,
    });
    res.status(500).json({ success: false, error: 'Failed to fetch generation' });
  }
};

export const deleteHistoryItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.userId;

  if (!userId) return res.status(401).json({ success: false, error: 'Authentication required' });

  try {
    const record = await prisma.generation.findUnique({
      where: { id },
      include: { repository: true },
    });

    if (!record || record.repository.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }

    // High-Water Mark Prerequisite Sync: Before Deleting, Ensure Lifetime Counter
    const userDynamicReadmes = await prisma.generation.count({
      where: { repository: { userId }, type: 'README' },
    });
    await prisma.$executeRaw`UPDATE "User" SET "lifetimeReadmes" = GREATEST("lifetimeReadmes", ${userDynamicReadmes}) WHERE id = ${userId}`;

    await prisma.generation.delete({ where: { id } });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    loggerService.error('database.delete.error', 'Failed to delete generation', error, {
      paramId: id,
    });
    res.status(500).json({ success: false, error: 'Failed to delete record' });
  }
};
