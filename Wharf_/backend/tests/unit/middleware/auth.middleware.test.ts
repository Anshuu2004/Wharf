import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { auth, requireAuth } from '../../../src/middleware/auth.middleware';
import * as honoJwt from 'hono/jwt';
import { createMockContext } from '../test-utils';

vi.mock('hono/jwt', () => ({
  verify: vi.fn()
}));

vi.mock('../../../src/db', () => ({
  __esModule: true,
  default: {},
  getPrisma: vi.fn().mockReturnValue({
    user: { findUnique: vi.fn() }
  })
}));

describe('Auth Middleware', () => {
  let mockEnv: any;
  let mockNext: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNext = vi.fn();
    mockEnv = { JWT_SECRET: 'test-secret' };
  });

  describe('auth', () => {
    it('should call next if no token is found', async () => {
      const c = createMockContext({ headers: {} }, mockEnv);
      await auth(c, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(c.get('user')).toBeUndefined();
    });

    it('should call next and set user context if token is valid', async () => {
      const c = createMockContext({ headers: { authorization: 'Bearer test-token' } }, mockEnv);
      c.set('contextStore', {});
      
      const decodedUser = { userId: 'u-1', username: 'testuser' };
      (honoJwt.verify as Mock).mockResolvedValue(decodedUser);
      
      const prismaObj = (await import('../../../src/db')).getPrisma('');
      (prismaObj.user.findUnique as Mock).mockResolvedValue({ githubAccessToken: 'enc', installationId: 'inst' });
      
      await auth(c, mockNext);
      
      expect(honoJwt.verify).toHaveBeenCalledWith('test-token', 'test-secret', 'HS256');
      expect(prismaObj.user.findUnique).toHaveBeenCalledWith({ where: { id: 'u-1' }, select: expect.any(Object) });
      expect(c.get('user')).toEqual({ ...decodedUser, githubAccessToken: 'enc', installationId: 'inst' });
      expect(c.get('contextStore').userId).toBe('u-1');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should catch errors and silently ignore bad tokens calling next safely', async () => {
      const c = createMockContext({ headers: { cookie: 'token=bad-token' } }, mockEnv);
      (honoJwt.verify as Mock).mockRejectedValue(new Error('Bad JWT'));

      await auth(c, mockNext);
      
      expect(honoJwt.verify).toHaveBeenCalled();
      expect(c.get('user')).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireAuth', () => {
    it('should block unauthenticated requests', async () => {
      const c = createMockContext({}, mockEnv, null);
      await requireAuth(c, mockNext);
      expect(c.json).toHaveBeenCalledWith({ success: false, error: 'Authentication required' }, 401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow authenticated requests', async () => {
      const c = createMockContext({}, mockEnv, { userId: '123' });
      await requireAuth(c, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
