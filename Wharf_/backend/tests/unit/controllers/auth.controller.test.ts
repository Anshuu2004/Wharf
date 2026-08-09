import { Request, Response } from 'express';
import { githubLogin, githubCallback, getMe, logout } from '../../../src/controllers/auth.controller';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import prisma from '../../../src/db';
import { encrypt } from '../../../src/utils/encryption';

jest.mock('axios');
jest.mock('jsonwebtoken');
jest.mock('../../../src/utils/encryption');
jest.mock('../../../src/db', () => ({
  __esModule: true,
  default: {
    user: {
      upsert: jest.fn(),
    }
  }
}));

describe('AuthController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  let mockRedirect: jest.Mock;
  let mockCookie: jest.Mock;
  let mockClearCookie: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRedirect = jest.fn();
    mockCookie = jest.fn();
    mockClearCookie = jest.fn();

    process.env.GITHUB_CLIENT_ID = 'test-client-id';
    process.env.FRONTEND_URL = 'http://test-front';

    mockReq = {
      query: {},
      user: {} as any
    };
    mockRes = {
      status: mockStatus,
      json: mockJson,
      redirect: mockRedirect,
      cookie: mockCookie,
      clearCookie: mockClearCookie
    };
  });

  describe('githubLogin', () => {
    it('should redirect to github oauth URL', () => {
      githubLogin(mockReq as Request, mockRes as Response);
      expect(mockRedirect).toHaveBeenCalledWith('https://github.com/login/oauth/authorize?client_id=test-client-id&scope=user:email,repo');
    });
  });

  describe('githubCallback', () => {
    it('should return 400 if no code is provided', async () => {
      mockReq.query = {};
      await githubCallback(mockReq as Request, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'No code provided' });
    });

    it('should exchange code, fetch profile, upsert user and set jwt cookie', async () => {
      mockReq.query = { code: 'some-code' };
      
      const mockTokenRes = { data: { access_token: 'gh-access-token' } };
      (axios.post as jest.Mock).mockResolvedValue(mockTokenRes);

      const mockUserProfile = { id: 123, login: 'testuser', created_at: '2026-01-01T00:00:00Z', avatar_url: 'u', email: 'e' };
      (axios.get as jest.Mock).mockResolvedValue({ data: mockUserProfile });

      (encrypt as jest.Mock).mockReturnValue('enc-token');

      const mockDbUser = { id: 1, username: 'testuser' };
      (prisma.user.upsert as jest.Mock).mockResolvedValue(mockDbUser);
      (jwt.sign as jest.Mock).mockReturnValue('jwt-token-signed');

      await githubCallback(mockReq as Request, mockRes as Response);

      expect(axios.post).toHaveBeenCalledWith('https://github.com/login/oauth/access_token', expect.any(Object), expect.any(Object));
      expect(axios.get).toHaveBeenCalledWith('https://api.github.com/user', { headers: { Authorization: 'Bearer gh-access-token' } });
      
      expect(prisma.user.upsert).toHaveBeenCalledWith(expect.objectContaining({
        where: { githubId: '123' }
      }));

      // No Cookie Should Be Set — Token Is Passed Via URL Param Now
      expect(mockCookie).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalledWith('http://test-front/auth/callback?token=jwt-token-signed');
    });

    it('should handle errors gracefully returning 500', async () => {
      mockReq.query = { code: 'err-code' };
      (axios.post as jest.Mock).mockRejectedValue(new Error('Network error'));
      await githubCallback(mockReq as Request, mockRes as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Authentication failed' });
    });
  });

  describe('getMe', () => {
    it('should return 401 if user is not in request', () => {
      (mockReq as any).user = undefined;
      getMe(mockReq as Request, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ success: false, error: 'Not authenticated' });
    });

    it('should return 200 with user payload if injected by middleware', () => {
      const u = { userId: 1, username: 'tester' };
      (mockReq as any).user = u as any;
      getMe(mockReq as Request, mockRes as Response);
      expect(mockJson).toHaveBeenCalledWith({ success: true, data: u });
    });
  });

  describe('logout', () => {
    it('should clear token cookie and return success message', () => {
      logout(mockReq as Request, mockRes as Response);
      expect(mockClearCookie).toHaveBeenCalledWith('token');
      expect(mockJson).toHaveBeenCalledWith({ success: true, message: 'Logged out successfully' });
    });
  });
});
