import { Request, Response } from 'express';
import prisma from '../db';
import { decrypt } from '../utils/encryption';
import { GithubService } from '../services/github.service';

export const getUserRepos = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    let encryptedToken = (req as any).user?.githubAccessToken;

    if (!encryptedToken) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { githubAccessToken: true } as any,
        });
        encryptedToken = user?.githubAccessToken;
      } catch (dbErr: any) {
        console.warn('[DB Error] Failed to read user from DB:', dbErr.message);
      }
    }

    if (!encryptedToken) {
      return res.status(400).json({ success: false, error: 'GitHub account not linked or database unreachable' });
    }

    const token = decrypt(encryptedToken);
    const githubService = new GithubService({ token });

    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.per_page as string) || 50;

    const repos = await githubService.fetchUserRepos(page, perPage);

    res.json({
      success: true,
      data: repos,
    });
  } catch (error: any) {
    console.error('Error fetching user repos:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch GitHub repositories',
    });
  }
};
