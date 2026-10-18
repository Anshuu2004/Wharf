import request from 'supertest';
import app from '../../src/index';

jest.mock('../../src/middleware/auth.middleware', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { userId: 'u-1' };
    next();
  },
  auth: (req: any, res: any, next: any) => {
    req.user = { userId: 'u-1' };
    next();
  }
}));

jest.mock('../../src/db', () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn().mockResolvedValue({ id: 'u-1', githubAccessToken: 'enc', installationId: null }) },
    profileReadme: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
      delete: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({ id: 'pr-1' })
    },
    $executeRaw: jest.fn().mockResolvedValue(0),
  }
}));

jest.mock('../../src/services/profile.service', () => ({
  ProfileService: jest.fn().mockImplementation(() => ({
    getProfileData: jest.fn().mockResolvedValue({
      username: 'target-user',
      bio: 'test bio',
      repos: 10,
      followers: 5,
      following: 3,
      joinDate: '2020-01-01',
      totalStars: 0,
    })
  }))
}));

jest.mock('../../src/utils/encryption', () => ({
  decrypt: jest.fn().mockReturnValue('dec-token')
}));

describe('Profile Routes Integration', () => {
  describe('GET /api/profile/:username', () => {
    it('should query through profile API to target', async () => {
      const res = await request(app).get('/api/profile/target-user');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/profile/history', () => {
    it('should get profile history', async () => {
      const res = await request(app).get('/api/profile/history');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/profile/stats', () => {
    it('should get profile stats', async () => {
      const res = await request(app).get('/api/profile/stats');
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/profile/:id', () => {
    it('should return 404 for non-existent record', async () => {
      const res = await request(app).delete('/api/profile/p-1');
      expect(res.status).toBe(404);
    });
  });
});
