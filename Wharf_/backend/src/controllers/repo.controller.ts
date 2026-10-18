import { Context } from 'hono';
import { RepoService } from '../services/repo.service';
import { decrypt } from '../utils/encryption';
import { getPrisma } from '../db';
import { Bindings } from '../index';

type AppContext = Context<{ Bindings: Bindings; Variables: { user: any; contextStore: any } }>;

export const analyzeRepo = async (c: AppContext) => {
  const body = await c.req.json().catch(() => ({}));
  const { repoUrl } = body;
  const user = c.get('user');
  const userId = user?.userId;

  if (!repoUrl) {
    return c.json({ success: false, error: 'Repository URL is required' }, 400);
  }

  try {
    let token: string | undefined;
    let installationId: string | undefined;

    let encryptedToken = user?.githubAccessToken;

    if (userId) {
      if (encryptedToken) {
        token = decrypt(encryptedToken, c.env.ENCRYPTION_SECRET);
      } else {
        try {
          const prisma = getPrisma(c.env.DATABASE_URL);
          const userDb = await prisma.user.findUnique({
            where: { id: userId },
            select: { githubAccessToken: true, installationId: true } as any,
          });

          if (userDb?.githubAccessToken) {
            token = decrypt(userDb.githubAccessToken as unknown as string, c.env.ENCRYPTION_SECRET);
          }
          if (userDb?.installationId) {
            installationId = userDb.installationId as unknown as string;
          }
        } catch (dbErr: any) {
          console.warn('[DB Error] Failed to read user from DB in repo.controller:', dbErr.message);
        }
      }
    }

    const repoService = new RepoService({ token, installationId });
    const analysis = await repoService.analyzeRepo(repoUrl);

    return c.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to analyze repository',
    }, error.status || 500);
  }
};

export const getRepo = async (c: AppContext) => {
  const id = c.req.param('id');
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const repo = await prisma.repository.findUnique({
      where: { id }
    });
    
    if (!repo) {
      return c.json({ success: false, error: 'Repository not found' }, 404);
    }
    
    return c.json(repo);
  } catch (error: any) {
    return c.json({ success: false, error: 'Failed to fetch repository' }, 500);
  }
};
