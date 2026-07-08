import { Request, Response } from 'express';
import { healthScoreService } from '../services/healthScore.service';
import { GithubService } from '../services/github.service';
import prisma from '../db';
import { parseGithubUrl } from '../utils/parseGithubUrl';
import { decrypt } from '../utils/encryption';

export class HealthController {
  async analyzeReadmeHealth(req: Request, res: Response) {
    const { repoUrl } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ success: false, error: 'repoUrl is required' });
    }

    const parsed = parseGithubUrl(repoUrl);
    if (!parsed) {
      return res.status(400).json({ success: false, error: 'Invalid GitHub URL' });
    }

    try {
      const user = (req as any).user;
      const token = user?.githubAccessToken ? decrypt(user.githubAccessToken) : undefined;
      const githubService = new GithubService(token ? { token } : undefined);
      const readmeContent = await githubService.getReadmeContent(parsed.owner, parsed.repo);

      const result = await healthScoreService.analyzeReadmeHealth(readmeContent);

      const repoName = `${parsed.owner}/${parsed.repo}`;

      // Save To Database
      await (prisma as any).healthScore.upsert({
        where: { repoUrl },
        update: {
          score: result.score,
          breakdown: result.breakdown,
          suggestions: result.suggestions,
          checkedAt: new Date(),
          userId: user?.userId ?? null,
        },
        create: {
          repoUrl,
          repoName,
          score: result.score,
          breakdown: result.breakdown,
          suggestions: result.suggestions,
          userId: user?.userId ?? null,
        },
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async analyzeContributionReadiness(req: Request, res: Response) {
    const { repoUrl } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ success: false, error: 'repoUrl is required' });
    }

    const parsed = parseGithubUrl(repoUrl);
    if (!parsed) {
      return res.status(400).json({ success: false, error: 'Invalid GitHub URL' });
    }

    try {
      const user = (req as any).user;
      const token = user?.githubAccessToken ? decrypt(user.githubAccessToken) : undefined;
      const githubService = new GithubService(token ? { token } : undefined);

      const [contributingFile, issueTemplates, prTemplates, hasCodeOfConduct, readmeContent] =
        await Promise.all([
          githubService.getContributingFile(parsed.owner, parsed.repo),
          githubService.getIssueTemplates(parsed.owner, parsed.repo),
          githubService.getPRTemplates(parsed.owner, parsed.repo),
          githubService.checkFileExists(parsed.owner, parsed.repo, 'CODE_OF_CONDUCT.md'),
          githubService.getReadmeContent(parsed.owner, parsed.repo),
        ]);

      const result = await healthScoreService.analyzeContributionReadiness(
        !!contributingFile,
        issueTemplates.length,
        prTemplates.length,
        hasCodeOfConduct,
        readmeContent,
        false
      );

      // Save Contribution Properties To DB
      await (prisma as any).healthScore.updateMany({
        where: { repoUrl },
        data: {
          contributionScore: result.score,
          contributionBreakdown: result.breakdown,
          contributionSuggestions: result.suggestions,
        },
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getHistory(req: Request, res: Response) {
    const user = (req as any).user;
    const userId = user?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const history = await (prisma as any).healthScore.findMany({
      where: { userId },
      orderBy: { checkedAt: 'desc' },
      select: {
        id: true,
        repoUrl: true,
        repoName: true,
        score: true,
        checkedAt: true,
      },
    });
    res.json({ success: true, data: history });
  }

  async deleteHistory(req: Request, res: Response) {
    const { id } = req.params;
    const user = (req as any).user;
    const userId = user?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    try {
      await (prisma as any).healthScore.delete({
        where: { id, userId },
      });
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ success: false, error: 'Record not found' });
    }
  }
}
