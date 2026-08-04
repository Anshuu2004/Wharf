import { vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';

// Comprehensive Mock For Authentication Middleware Components
export const optionalAuth = vi.fn((req: Request, res: Response, next: NextFunction) => {
  // By Default, Just Call Next In Tests Via This Mock
  next();
});

export const requireAuth = vi.fn((req: Request, res: Response, next: NextFunction) => {
  const customReq = req as any;
  if (!customReq.user) {
    customReq.user = { id: 'mock-user-cuid', username: 'testuser' };
  }
  next();
});
