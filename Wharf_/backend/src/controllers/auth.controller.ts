import { Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';
import axios from 'axios';
import { getPrisma } from '../db';
import { encrypt } from '../utils/encryption';
import { Bindings } from '../index';

type AppContext = Context<{ Bindings: Bindings; Variables: { user: any } }>;

export const githubLogin = (c: AppContext) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${c.env.GITHUB_CLIENT_ID}&scope=user:email,repo`;
  return c.redirect(githubAuthUrl);
};


export const githubCallback = async (c: AppContext) => {
  const code = c.req.query('code');
  const installation_id = c.req.query('installation_id');
  const FRONTEND_URL = c.env.FRONTEND_URL || 'http://localhost:5173';

  if (!code) {
    return c.json({ error: 'No code provided' }, 400);
  }

  try {
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: c.env.GITHUB_CLIENT_ID,
        client_secret: c.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return c.json({ error: 'Failed to obtain access token' }, 400);
    }

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const githubUser = userResponse.data;
    const encryptedToken = encrypt(accessToken, c.env.ENCRYPTION_SECRET);
    const prisma = getPrisma(c.env.DATABASE_URL);

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

    const JWT_SECRET = c.env.JWT_SECRET || 'secret';
    const ADMIN_IDS = (c.env.ADMIN_IDS || '').split(',');
    const isAdmin = ADMIN_IDS.includes(user.id.toString());

    const now = Math.floor(Date.now() / 1000);
    const token = await sign(
      {
        userId: user.id,
        username: user.username,
        githubCreatedAt: (user as any).githubCreatedAt,
        email: user.email,
        avatar: user.avatar,
        isAdmin: isAdmin,
        exp: now + 7 * 24 * 60 * 60,
      },
      JWT_SECRET
    );

    setCookie(c, 'token', token, {
      httpOnly: true,
      secure: c.env.ENVIRONMENT === 'production',
      sameSite: 'Lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, 
    });

    return c.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ error: 'Authentication failed' }, 500);
  }
};

export const getMe = (c: AppContext) => {
  const user = c.get('user');
  if (!user) return c.json({ success: false, error: 'Not authenticated' }, 401);
  return c.json({ success: true, data: user });
};

export const logout = (c: AppContext) => {
  deleteCookie(c, 'token');
  return c.json({ success: true, message: 'Logged out successfully' });
};
