import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'secret';
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);

    // Fetch Secure Tokens From Database
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { githubAccessToken: true, installationId: true },
    });

    (req as any).user = {
      ...decoded,
      githubAccessToken: dbUser?.githubAccessToken,
      installationId: dbUser?.installationId,
    };

    if ((req as any).contextStore) {
      (req as any).contextStore.userId = decoded.userId || decoded.id;
      (req as any).contextStore.username = decoded.username || decoded.githubUsername;
    }

    next();
  } catch (error: any) {
    next();
  }
};

// Middleware To Require Authentication For Specific Routes.
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  next();
};
