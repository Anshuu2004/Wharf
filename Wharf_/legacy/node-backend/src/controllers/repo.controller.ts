import { Request, Response } from 'express';
import { RepoService } from '../services/repo.service';
import { decrypt } from '../utils/encryption';
import prisma from '../db';

export const analyzeRepo = async (req: Request, res: Response) => {
  const { repoUrl } = req.body;
  const userId = (req as any).user?.userId;

  if (!repoUrl) {
    return res.status(400).json({ success: false, error: 'Repository URL is required' });
  }

  try {
    let token: string | undefined;
    let installationId: string | undefined;

    // Try To Read Encrypted Token Directly From JWT First
    let encryptedToken = (req as any).user?.githubAccessToken;

    if (userId) {
      if (encryptedToken) {
        token = decrypt(encryptedToken);
      } else {
        try {
          const user = await (prisma.user.findUnique({
            where: { id: userId },
            select: { githubAccessToken: true, installationId: true } as any,
          }) as any);

          if (user?.githubAccessToken) {
            token = decrypt(user.githubAccessToken);
          }
          if (user?.installationId) {
            installationId = user.installationId;
          }
        } catch (dbErr: any) {
          console.warn('[DB Error] Failed to read user from DB in repo.controller:', dbErr.message);
        }
      }
    }

    const repoService = new RepoService({ token, installationId });
    const analysis = await repoService.analyzeRepo(repoUrl);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Failed to analyze repository',
    });
  }
};
