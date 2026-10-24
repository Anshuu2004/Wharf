import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';
import { getPrisma } from '../db';
import { Bindings } from '../index';
import { getJwtSecret } from '../utils/jwtSecret';

type Variables = {
  user: any;
  contextStore: any;
};

export const auth = createMiddleware<{ Bindings: Bindings; Variables: Variables }>(async (c, next) => {
  const authHeader = c.req.header('authorization');
  
  let token = getCookie(c, 'token');

  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  let JWT_SECRET: string;
  try {
    JWT_SECRET = getJwtSecret(c.env);
  } catch (error) {
    console.error('Auth middleware misconfigured:', error instanceof Error ? error.message : error);
    return c.json({ success: false, error: 'Server misconfiguration' }, 500);
  }

  try {
    const decoded: any = await verify(token, JWT_SECRET, 'HS256');

    // Fetch Secure Tokens From Database using Edge Prisma
    const prisma = getPrisma(c.env.DATABASE_URL);
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { githubAccessToken: true, installationId: true },
    });

    c.set('user', {
      ...decoded,
      githubAccessToken: dbUser?.githubAccessToken,
      installationId: dbUser?.installationId,
    });

    // Initialize contextStore if needed
    let contextStore = c.get('contextStore') || {};
    contextStore.userId = decoded.userId || decoded.id;
    contextStore.username = decoded.username || decoded.githubUsername;
    c.set('contextStore', contextStore);

    await next();
  } catch (error: any) {
    // Invalid Token, Just Proceed Unauthenticated
    await next();
  }
});

// Middleware To Require Authentication For Specific Routes
export const requireAuth = createMiddleware<{ Bindings: Bindings; Variables: Variables }>(async (c, next) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ success: false, error: 'Authentication required' }, 401);
  }
  await next();
});
