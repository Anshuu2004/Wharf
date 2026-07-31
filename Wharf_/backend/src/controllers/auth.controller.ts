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
    const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',');

    // Check If The User Is An Admin
    const isAdmin = ADMIN_IDS.includes(user.id.toString());

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        githubCreatedAt: (user as any).githubCreatedAt,
        email: user.email,
        avatar: user.avatar,
        isAdmin: isAdmin,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Set Cookie And Redirect Back To Frontend Callback
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${FRONTEND_URL}/auth/callback`);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const getMe = (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ success: false, error: 'Not authenticated' });
  res.json({ success: true, data: user });
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};
