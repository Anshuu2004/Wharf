import { Request, Response, NextFunction } from 'express';
import { auth, requireAuth } from '../../../src/middleware/auth.middleware';
import jwt from 'jsonwebtoken';
import prisma from '../../../src/db';

jest.mock('jsonwebtoken');
jest.mock('../../../src/db', () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn() }
  }
}));

describe('Auth Middleware', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJson = jest.fn();
    mockNext = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockReq = {
      headers: {}, cookies: {}
    };
    mockRes = { status: mockStatus, json: mockJson };
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('auth', () => {
    it('should call next if no token is found', async () => {
      await auth(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
    });

    it('should call next and set user context if token is valid', async () => {
      mockReq.headers.authorization = 'Bearer test-token';
      const decodedUser = { userId: 'u-1', username: 'testuser' };
      (jwt.verify as jest.Mock).mockReturnValue(decodedUser);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ githubAccessToken: 'enc', installationId: 'inst' });
      
      mockReq.contextStore = {};

      await auth(mockReq as Request, mockRes as Response, mockNext);
      
      expect(jwt.verify).toHaveBeenCalledWith('test-token', 'test-secret');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'u-1' }, select: expect.any(Object) });
      expect(mockReq.user).toEqual({ ...decodedUser, githubAccessToken: 'enc', installationId: 'inst' });
      expect(mockReq.contextStore.userId).toBe('u-1');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should catch errors and silently ignore bad tokens calling next safely', async () => {
      mockReq.cookies = { token: 'bad-token' };
      (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('Bad JWT'); });

      await auth(mockReq as Request, mockRes as Response, mockNext);
      
      expect(jwt.verify).toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireAuth', () => {
    it('should block unauthenticated requests', () => {
      requireAuth(mockReq as Request, mockRes as Response, mockNext);
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ success: false, error: 'Authentication required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow authenticated requests', () => {
      mockReq.user = { userId: '123' };
      requireAuth(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });
  });
});
