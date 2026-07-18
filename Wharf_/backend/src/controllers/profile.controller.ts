import { Request, Response } from 'express';
import { ProfileService } from '../services/profile.service';
import { aiService } from '../services/ai.service';
import { cacheService } from '../services/cache.service';
import prisma from '../db';
import { decrypt } from '../utils/encryption';
import crypto from 'crypto';

export const getProfile = async (req: Request, res: Response) => {
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
    console.error('getProfile error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to get profile' });
  }
};

export const generate = async (req: Request, res: Response) => {
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
      console.log(`[Cache] Cache hit for Profile README: ${username}`);
      const chunkSize = 100;
      for (let i = 0; i < cachedReadme.length; i += chunkSize) {
        const chunk = cachedReadme.slice(i, i + chunkSize);
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    const generatedMarkdown = await aiService.generateProfileStream(
      profileData,
      options,
      userId,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
    );

    await cacheService.setProfileReadme(username, template, theme, hash, generatedMarkdown);

    if (userId) {
      try {
        console.log(
          `[DB SAVE] Attempting to save profile readme for user ${userId}, username ${username}`
        );
        const record = await prisma.profileReadme.create({
          data: {
            userId,
            username,
            content: generatedMarkdown,
            wordCount: generatedMarkdown.split(/\s+/).filter(Boolean).length,
            template,
            theme,
            badges: options.githubBadges || [],
            showStats: options.showStats ?? true,
            showTopLanguages: options.showTopLanguages ?? true,
            showContributions: options.showContributions ?? true,
          },
        });
        console.log(`[DB SAVE SUCCESS] Saved profile readme with ID: ${record.id}`);

        // Update stats
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
        console.error(
          '[CRITICAL DB ERROR] Failed to save profile generation to DB:',
          dbError?.message || dbError
        );
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Profile README generation error:', error);
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
    console.error('Failed to fetch profile history:', error);
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
    console.error('Failed to fetch stats:', error);
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

    await prisma.profileReadme.delete({ where: { id } });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete profile history:', error);
    res.status(500).json({ success: false, error: 'Failed to delete record' });
  }
};
