import app from '../../src/index';

vi.mock('../../src/middleware/auth.middleware', () => ({
  requireAuth: async (c: any, next: any) => {
    c.set('user', { userId: 'u-1' });
    await next();
  },
  auth: async (c: any, next: any) => {
    c.set('user', { userId: 'u-1' });
    await next();
  }
}));

vi.mock('../../src/db', () => {
  const dbMock = {
    user: { findUnique: vi.fn().mockResolvedValue({ id: 'u-1', githubAccessToken: 'enc', installationId: null }) },
    profileReadme: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      delete: vi.fn().mockResolvedValue({}),
      create: vi.fn().mockResolvedValue({ id: 'pr-1' })
    },
    $executeRaw: vi.fn().mockResolvedValue(0),
  };
  return {
    __esModule: true,
    default: dbMock,
    getPrisma: vi.fn().mockReturnValue(dbMock)
  };
});

vi.mock('../../src/services/profile.service', () => ({
  ProfileService: vi.fn().mockImplementation(function() { return {
    getProfileData: vi.fn().mockResolvedValue({
      username: 'target-user',
      bio: 'test bio',
      repos: 10,
      followers: 5,
      following: 3,
      joinDate: '2020-01-01',
      totalStars: 0,
    })
  }; })
}));

vi.mock('../../src/utils/encryption', () => ({
  decrypt: vi.fn().mockReturnValue('dec-token')
}));

describe('Profile Routes Integration', () => {
  describe('GET /api/profile/:username', () => {
    it('should query through profile API to target', async () => {
      const res = await app.request('/api/profile/target-user');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/profile/history', () => {
    it('should get profile history', async () => {
      const res = await app.request('/api/profile/history');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/profile/stats', () => {
    it('should get profile stats', async () => {
      const res = await app.request('/api/profile/stats');
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/profile/:id', () => {
    it('should return 404 for non-existent record', async () => {
      const res = await app.request('/api/profile/p-1', { method: 'DELETE' });
      expect(res.status).toBe(404);
    });
  });
});
