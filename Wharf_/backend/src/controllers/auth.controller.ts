import { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import prisma from '../db';
import { encrypt } from '../utils/encryption';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const githubLogin = (req: Request, res: Response) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user:email,repo`;
  res.redirect(githubAuthUrl);
};

export const githubCallback = async (req: Request, res: Response) => {
  const { code, installation_id } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    // 1. Exchange Code For Access Token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.status(400).json({ error: 'Failed to obtain access token' });
    }

    // 2. Fetch User Info From GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const githubUser = userResponse.data;

    // 3. Upsert User In Database
    const encryptedToken = encrypt(accessToken);

    const user = await prisma.user.upsert({
      where: { githubId: githubUser.id.toString() },
      update: {
        username: githubUser.login,
        avatar: githubUser.avatar_url,
        email: githubUser.email,
        githubAccessToken: encryptedToken,
        githubCreatedAt: new Date(githubUser.created_at),
        installationId: (installation_id ? installation_id.toString() : undefined) as any,
      } as any,
      create: {
        githubId: githubUser.id.toString(),
        username: githubUser.login,
        avatar: githubUser.avatar_url,
        email: githubUser.email,
        githubAccessToken: encryptedToken,
        githubCreatedAt: new Date(githubUser.created_at),
        installationId: (installation_id ? installation_id.toString() : undefined) as any,
      } as any,
    });

    // 4. Create JWT
    const JWT_SECRET = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        githubCreatedAt: (user as any).githubCreatedAt,
        email: user.email,
        avatar: user.avatar,
        githubAccessToken: user.githubAccessToken
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Redirect Back To Frontend With Token
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
