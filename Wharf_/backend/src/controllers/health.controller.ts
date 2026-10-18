import { Context } from 'hono';
import { healthScoreService } from '../services/healthScore.service';
import { GithubService } from '../services/github.service';
import { getPrisma } from '../db';
import { parseGithubUrl } from '../utils/parseGithubUrl';
import { decrypt } from '../utils/encryption';
import { recordDailyGeneration } from '../utils/dailyStats';
import { loggerService } from '../utils/logger';
import { Bindings } from '../index';

type AppContext = Context<{ Bindings: Bindings; Variables: { user: any } }>;

export class HealthController {
  async analyzeReadmeHealth(c: AppContext) {
    const reqStart = Date.now();
    const body = await c.req.json().catch(() => ({}));
    const { repoUrl } = body;
    if (!repoUrl) {
      return c.json({ success: false, error: 'repoUrl is required' }, 400);
    }

    const parsed = parseGithubUrl(repoUrl);
    if (!parsed) {
      return c.json({ success: false, error: 'Invalid GitHub URL' }, 400);
    }

    try {
      const user = c.get('user');
      const token = user?.githubAccessToken ? decrypt(user.githubAccessToken, c.env.ENCRYPTION_SECRET) : undefined;
      const githubService = new GithubService(token ? { token } : undefined);
      const readmeContent = await githubService.getReadmeContent(parsed.owner, parsed.repo);

      const result = await healthScoreService.analyzeReadmeHealth(readmeContent);
      const repoName = `${parsed.owner}/${parsed.repo}`;

      const prisma = getPrisma(c.env.DATABASE_URL);
      await (prisma as any).healthScore.upsert({
        where: { repoUrl },
        update: { score: result.score, breakdown: result.breakdown, suggestions: result.suggestions, checkedAt: new Date(), userId: user?.userId ?? null },
        create: { repoUrl, repoName, score: result.score, breakdown: result.breakdown, suggestions: result.suggestions, userId: user?.userId ?? null },
      });

      if (user?.userId) {
        const uid = user.userId;
        await Promise.all([
          prisma.$executeRaw`UPDATE "User" SET "lifetimeTokens" = "lifetimeTokens" + 213, "lifetimeHealthChecks" = "lifetimeHealthChecks" + 1 WHERE id = ${uid}`,
          recordDailyGeneration(c.env.DATABASE_URL, uid)
        ]);
      }

      return c.json({ success: true, data: result });
    } catch (error: any) {
      loggerService.error('health.analysis.error', 'Health check failed', error, { repository: repoUrl });
      return c.json({ success: false, error: error.message }, 500);
    }
  }

  async analyzeContributionReadiness(c: AppContext) {
    const reqStart = Date.now();
    const body = await c.req.json().catch(() => ({}));
    const { repoUrl } = body;
    if (!repoUrl) {
      return c.json({ success: false, error: 'repoUrl is required' }, 400);
    }

    const parsed = parseGithubUrl(repoUrl);
    if (!parsed) {
      return c.json({ success: false, error: 'Invalid GitHub URL' }, 400);
    }

    try {
      const user = c.get('user');
      const token = user?.githubAccessToken ? decrypt(user.githubAccessToken, c.env.ENCRYPTION_SECRET) : undefined;
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
        !!contributingFile, issueTemplates.length, prTemplates.length, hasCodeOfConduct, readmeContent, false
      );

      const prisma = getPrisma(c.env.DATABASE_URL);
      await (prisma as any).healthScore.updateMany({
        where: { repoUrl },
        data: { contributionScore: result.score, contributionBreakdown: result.breakdown, contributionSuggestions: result.suggestions },
      });

      return c.json({ success: true, data: result });
    } catch (error: any) {
      loggerService.error('health.contribution.error', 'Contribution analysis failed', error, { repository: repoUrl });
      return c.json({ success: false, error: error.message }, 500);
    }
  }

  async getHistory(c: AppContext) {
    const user = c.get('user');
    const userId = user?.userId;
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 200);
    const skip = (page - 1) * limit;

    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);
    
    const prisma = getPrisma(c.env.DATABASE_URL);
    const history = await (prisma as any).healthScore.findMany({
      where: { userId }, skip, take: limit, orderBy: { checkedAt: 'desc' },
      select: { id: true, repoUrl: true, repoName: true, score: true, checkedAt: true },
    });
    return c.json({ success: true, data: history });
  }

  async deleteHistory(c: AppContext) {
    const id = c.req.param('id');
    const user = c.get('user');
    const userId = user?.userId;
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

    try {
      const prisma = getPrisma(c.env.DATABASE_URL);
      const dynamicHealth = await prisma.healthScore.count({ where: { userId } });
      await prisma.$executeRaw`UPDATE "User" SET "lifetimeHealthChecks" = GREATEST("lifetimeHealthChecks", ${dynamicHealth}) WHERE id = ${userId}`;
      await (prisma as any).healthScore.delete({ where: { id, userId } });
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ success: false, error: 'Record not found' }, 400);
    }
  }
}
