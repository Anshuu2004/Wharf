// MUST Set GITHUB_CLIENT_ID BEFORE Importing App — auth.controller.ts Reads It At Module Load Time
// With `const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;`
process.env.GITHUB_CLIENT_ID = 'cid';
process.env.FRONTEND_URL = 'http://localhost:3000';

import app from '../../src/index';

vi.mock('hono/jwt', () => ({
  verify: vi.fn().mockResolvedValue({ userId: 'u-1' }),
  sign: vi.fn().mockResolvedValue('fake-jwt-token'),
  decode: vi.fn().mockReturnValue({ header: {}, payload: { userId: 'u-1' } })
}));

vi.mock('axios', () => {
  const mockAxios = {
    post: vi.fn().mockResolvedValue({ data: { access_token: 'mock-access-token' } }),
    get: vi.fn().mockResolvedValue({ data: { id: 1, login: 'octocat', avatar_url: '', email: '', created_at: '2026-01-01' } })
  };
  return {
    default: mockAxios,
    ...mockAxios
  };
});

vi.mock('../../src/services/github.service', () => ({
  GithubService: vi.fn().mockImplementation(function() { return {
    getAccessToken: vi.fn().mockResolvedValue('fake-access-token'),
    getUserProfile: vi.fn().mockResolvedValue({ login: 'octocat', id: 1, email: 'octo@github.com' })
  }; })
}));

vi.mock('../../src/db', () => {
  const dbMock = {
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: 'u-1', login: 'octocat', name: 'The Octocat', githubAccessToken: null, installationId: null }),
      upsert: vi.fn().mockResolvedValue({ id: 'u-1', login: 'octocat', username: 'octocat', avatar: null, email: 'octo@github.com' })
    }
  };
  return {
    __esModule: true,
    default: dbMock,
    getPrisma: vi.fn().mockReturnValue(dbMock)
  };
});

describe('Auth Routes Integration', () => {
  describe('GET /api/auth/github', () => {
    it('should redirect back to github authorize endpoint', async () => {
      const response = await app.request('/api/auth/github');
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toMatch(/github\.com\/login\/oauth\/authorize\?client_id=cid/);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear token cookie and return success', async () => {
      const response = await app.request('/api/auth/logout', { method: 'POST' });
      expect(response.status).toBe(200);
      const body = await response.json() as any;
      expect(body.success).toBe(true);
    });
  });

  describe('GET /api/auth/github/callback', () => {
    // Start a login like the browser would and keep the state cookie it sets.
    const startLogin = async () => {
      const login = await app.request('/api/auth/github');
      const state = new URL(login.headers.get('location')!).searchParams.get('state')!;
      const setCookie = login.headers.get('set-cookie')!;
      return { state, cookie: setCookie.split(';')[0] };
    };

    it('should set a short lived, httpOnly state cookie scoped to the auth routes', async () => {
      const login = await app.request('/api/auth/github');
      const setCookie = login.headers.get('set-cookie')!;
      const state = new URL(login.headers.get('location')!).searchParams.get('state');

      expect(setCookie).toContain(`oauth_state=${state}`);
      expect(setCookie).toContain('HttpOnly');
      expect(setCookie).toContain('Path=/api/auth');
      expect(setCookie).toContain('Max-Age=600');
      expect(setCookie).toContain('SameSite=Lax');
    });

    it('should complete the login when the state matches the cookie', async () => {
      const { state, cookie } = await startLogin();
      const response = await app.request(`/api/auth/github/callback?code=mock-code&state=${state}`, {
        headers: { Cookie: cookie },
      });
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/auth/callback?token=');
    });

    it('should reject a callback without state with 403', async () => {
      const { cookie } = await startLogin();
      const response = await app.request('/api/auth/github/callback?code=mock-code', {
        headers: { Cookie: cookie },
      });
      expect(response.status).toBe(403);
    });

    it('should reject a callback whose state does not match the cookie with 403', async () => {
      const { cookie } = await startLogin();
      const response = await app.request('/api/auth/github/callback?code=mock-code&state=forged', {
        headers: { Cookie: cookie },
      });
      expect(response.status).toBe(403);
    });

    it('should reject a callback without the state cookie with 403', async () => {
      const { state } = await startLogin();
      const response = await app.request(`/api/auth/github/callback?code=mock-code&state=${state}`);
      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await app.request('/api/auth/me');
      expect(response.status).toBe(401);
    });

    it('should return user info when authenticated', async () => {
      const response = await app.request('/api/auth/me', {
        headers: { Cookie: `token=fake-jwt-token` }
      });

      expect(response.status).toBe(200);
      const body = await response.json() as any;
      expect(body.success).toBe(true);
    });
  });
});
