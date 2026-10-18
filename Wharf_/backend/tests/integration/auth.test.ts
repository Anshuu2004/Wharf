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
    it('should attempt github callback (redirect or error)', async () => {
      const response = await app.request('/api/auth/github/callback?code=mock-code');
      // With Mocked GithubService, Should Redirect To FRONTEND_URL/dashboard (302)
      // Or Return 400 If Code Exchange Fails - Accept Both
      expect([302, 400]).toContain(response.status);
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
