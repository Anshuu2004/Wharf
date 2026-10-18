import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';

// Comprehensive Mock For Authentication Middleware Components
export const optionalAuth = jest.fn((req: Request, res: Response, next: NextFunction) => {
  // By Default, Just Call Next In Tests Via This Mock
  next();
});

export const requireAuth = jest.fn((req: Request, res: Response, next: NextFunction) => {
  const customReq = req as any;
  if (!customReq.user) {
    customReq.user = { id: 'mock-user-cuid', username: 'testuser' };
  }
  next();
});
