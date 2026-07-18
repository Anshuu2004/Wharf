import { Request, Response } from 'express';
import { aiService, ChangelogService, GithubService, cacheService } from '../services';
import prisma from '../db';
import { decrypt } from '../utils/encryption';

function extractRepoName(repoUrl: string): string {
  try {
    const url = new URL(repoUrl);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return repoUrl;
  } catch {
    const parts = repoUrl.split('/');
    return parts.slice(-2).join('/');
  }
}

export class ChangelogController {
  private changelogService: ChangelogService;

  constructor() {
    const githubService = new GithubService();
    this.changelogService = new ChangelogService(githubService, aiService);
  }

  async getStats(req: Request, res: Response) {
    const { repoUrl } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ success: false, error: 'repoUrl is required' });
    }

    try {
      const user = (req as any).user;
      let githubToken;
      if (user?.githubAccessToken) {
        githubToken = decrypt(user.githubAccessToken);
      }

      const stats = await this.changelogService.getCommitStats(repoUrl, githubToken);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async generate(req: Request, res: Response) {
    const { repoUrl, options } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ success: false, error: 'repoUrl is required' });
    }

    try {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const user = (req as any).user;
      let githubToken;
      if (user?.githubAccessToken) {
        githubToken = decrypt(user.githubAccessToken);
      }

      const cached = await cacheService.getChangelog(repoUrl, options);
      if (cached) {
        // Stream It Block By Block Or All At Once
        res.write(`data: ${JSON.stringify({ text: cached })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      const stream = await this.changelogService.generateChangelog(repoUrl, options, githubToken);
      let fullContent = '';

      for await (const chunk of stream) {
        fullContent += chunk;
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }

      // Save To Cache
      await cacheService.setChangelog(repoUrl, options, fullContent);

      const userId = (req as any).user?.id || (req as any).user?.userId;
      if (userId) {
        try {
          const wordCount = fullContent.split(/\s+/).filter(Boolean).length;
          await prisma.changelog.create({
            data: {
              repoUrl,
              repoName: extractRepoName(repoUrl),
              content: fullContent,
              wordCount,
              format: options.format || 'keep-a-changelog',
              commitCount: Number(options.commitCount) || 100,
              includeTags: options.includeTags ?? true,
              includeContributors: options.includeContributors ?? true,
              groupByType: options.groupByType ?? true,
              userId,
            },
          });
          // Permanently Bank These Tokens
          const tokensGenerated = Math.round(wordCount * 1.37);
          await prisma.$executeRaw`UPDATE "User" SET "lifetimeTokens" = "lifetimeTokens" + ${tokensGenerated}, "lifetimeChangelogs" = "lifetimeChangelogs" + 1 WHERE id = ${userId}`;
        } catch (dbError) {
          console.error('DB Save Error:', dbError);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const history = await this.changelogService.getHistory(userId);
      res.json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteChangelog(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id || (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      await this.changelogService.deleteChangelog(id, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
