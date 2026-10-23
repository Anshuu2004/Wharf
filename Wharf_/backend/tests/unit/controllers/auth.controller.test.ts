import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import type { Mock } from "vitest";
import { githubLogin, githubCallback, getMe, logout } from '../../../src/controllers/auth.controller';
import axios from 'axios';
import { createMockContext } from '../test-utils';
import * as cookieMod from 'hono/cookie';

vi.mock('axios');
vi.mock('../../../src/utils/encryption');
vi.mock('hono/cookie', () => ({
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
  getCookie: vi.fn(),
}));
vi.mock('hono/jwt', () => ({
  sign: vi.fn().mockResolvedValue('jwt-token-signed'),
  verify: vi.fn(),
}));

vi.mock('../../../src/db', () => ({
  __esModule: true,
  default: { user: { upsert: vi.fn() } },
  getPrisma: vi.fn().mockReturnValue({
    user: { upsert: vi.fn() }
  })
}));

describe('AuthController', () => {
  let mockEnv: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv = {
      GITHUB_CLIENT_ID: 'test-client-id',
      GITHUB_CLIENT_SECRET: 'test-client-secret',
      FRONTEND_URL: 'http://test-front',
      ENCRYPTION_SECRET: 'test-secret',
      JWT_SECRET: 'jwt-secret',
    };
  });

  describe('githubLogin', () => {
    it('should redirect to github oauth URL with a state that matches the state cookie', () => {
      const c = createMockContext({}, mockEnv);
      githubLogin(c);

      const url = new URL((c.redirect as Mock).mock.calls[0][0]);
      expect(`${url.origin}${url.pathname}`).toBe('https://github.com/login/oauth/authorize');
      expect(url.searchParams.get('client_id')).toBe('test-client-id');
      expect(url.searchParams.get('scope')).toBe('user:email,repo');

      const state = url.searchParams.get('state');
      expect(state).toMatch(/^[0-9a-f-]{36}$/);
      expect(cookieMod.setCookie).toHaveBeenCalledWith(c, 'oauth_state', state, expect.objectContaining({
        httpOnly: true,
        sameSite: 'Lax',
        path: '/api/auth',
        maxAge: 600,
      }));
    });

    it('should use a new state for every login', () => {
      const first = createMockContext({}, mockEnv);
      const second = createMockContext({}, mockEnv);
      githubLogin(first);
      githubLogin(second);

      const stateOf = (c: any) => new URL((c.redirect as Mock).mock.calls[0][0]).searchParams.get('state');
      expect(stateOf(first)).not.toBe(stateOf(second));
    });

    it('should only mark the state cookie secure in production or over https', () => {
      const cases = [
        { env: { ...mockEnv }, url: 'http://localhost:8787/api/auth/github', secure: false },
        { env: { ...mockEnv }, url: 'https://preview.wharf.dev/api/auth/github', secure: true },
        { env: { ...mockEnv, ENVIRONMENT: 'production' }, url: undefined, secure: true },
      ];
      for (const { env, url, secure } of cases) {
        vi.clearAllMocks();
        const c = createMockContext({}, env);
        c.req.url = url;
        githubLogin(c);
        expect(cookieMod.setCookie).toHaveBeenCalledWith(c, 'oauth_state', expect.any(String), expect.objectContaining({ secure }));
      }
    });
  });

  describe('githubCallback', () => {
    // cookieState null = no state cookie in the request
    const withState = (query: Record<string, string>, cookieState: string | null = 'state-123') => {
      (cookieMod.getCookie as Mock).mockReturnValue(cookieState ?? undefined);
      return createMockContext({ query: { state: 'state-123', ...query } }, mockEnv);
    };

    it('should reject with 403 when the state query param is missing', async () => {
      (cookieMod.getCookie as Mock).mockReturnValue('state-123');
      const c = createMockContext({ query: { code: 'some-code' } }, mockEnv);

      await githubCallback(c);
      expect(c.json).toHaveBeenCalledWith({ error: 'Invalid or missing OAuth state' }, 403);
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should reject with 403 when the state cookie is missing', async () => {
      const c = withState({ code: 'some-code' }, null);

      await githubCallback(c);
      expect(c.json).toHaveBeenCalledWith({ error: 'Invalid or missing OAuth state' }, 403);
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should reject with 403 when the state does not match the cookie', async () => {
      const c = withState({ code: 'some-code', state: 'attacker-state' });

      await githubCallback(c);
      expect(c.json).toHaveBeenCalledWith({ error: 'Invalid or missing OAuth state' }, 403);
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should clear the state cookie whether the check passes or fails', async () => {
      const rejected = withState({ code: 'some-code', state: 'attacker-state' });
      await githubCallback(rejected);
      expect(cookieMod.deleteCookie).toHaveBeenCalledWith(rejected, 'oauth_state', expect.objectContaining({ path: '/api/auth' }));

      vi.clearAllMocks();
      const accepted = withState({});
      await githubCallback(accepted);
      expect(cookieMod.deleteCookie).toHaveBeenCalledWith(accepted, 'oauth_state', expect.objectContaining({ path: '/api/auth' }));
    });

    it('should return 400 if no code is provided', async () => {
      const c = withState({});

      const res = await githubCallback(c);
      expect(c.json).toHaveBeenCalledWith({ error: 'No code provided' }, 400);
    });

    it('should exchange code, fetch profile, upsert user and set jwt cookie via hono/cookie', async () => {
      const c = withState({ code: 'some-code' });
      
      const mockTokenRes = { data: { access_token: 'gh-access-token' } };
      (axios.post as Mock).mockResolvedValue(mockTokenRes);

      const mockUserProfile = { id: 123, login: 'testuser', created_at: '2026-01-01T00:00:00Z', avatar_url: 'u', email: 'e' };
      (axios.get as Mock).mockResolvedValue({ data: mockUserProfile });

      const mockDbUser = { id: 1, username: 'testuser' };
      const prismaObj = (await import('../../../src/db')).getPrisma('');
      (prismaObj.user.upsert as Mock).mockResolvedValue(mockDbUser);

      await githubCallback(c);

      expect(axios.post).toHaveBeenCalledWith('https://github.com/login/oauth/access_token', expect.any(Object), expect.any(Object));
      expect(axios.get).toHaveBeenCalledWith('https://api.github.com/user', { headers: { Authorization: 'Bearer gh-access-token' } });
      expect(prismaObj.user.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { githubId: '123' } }));
      
      expect(cookieMod.setCookie).toHaveBeenCalledWith(c, 'token', expect.any(String), expect.any(Object));
      expect(c.redirect).toHaveBeenCalledWith(expect.stringContaining(`${mockEnv.FRONTEND_URL}/auth/callback?token=`));
    });

    it('should handle errors gracefully returning 500', async () => {
      const c = withState({ code: 'err' });
      (axios.post as Mock).mockRejectedValue(new Error('Network error'));
      
      await githubCallback(c);
      expect(c.json).toHaveBeenCalledWith({ error: 'Authentication failed' }, 500);
    });
  });

  describe('getMe', () => {
    it('should return 401 if user is not in request', () => {
      const c = createMockContext({}, mockEnv, null);
      getMe(c);
      expect(c.json).toHaveBeenCalledWith({ success: false, error: 'Not authenticated' }, 401);
    });

    it('should return 200 with user payload if injected by middleware', () => {
      const u = { userId: 1, username: 'tester' };
      const c = createMockContext({}, mockEnv, u);
      getMe(c);
      expect(c.json).toHaveBeenCalledWith({ success: true, data: u });
    });
  });

  describe('logout', () => {
    it('should clear token cookie and return success message', () => {
      const c = createMockContext({}, mockEnv);
      logout(c);
      expect(cookieMod.deleteCookie).toHaveBeenCalledWith(c, 'token');
      expect(c.json).toHaveBeenCalledWith({ success: true, message: 'Logged out successfully' });
    });
  });
});
