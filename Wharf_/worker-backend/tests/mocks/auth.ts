import { vi } from 'vitest';

// Comprehensive Mock For Authentication Middleware Components
export const optionalAuth = vi.fn(async (c: any, next: any) => {
  // By Default, Just Call Next In Tests Via This Mock
  await next();
});

export const requireAuth = vi.fn(async (c: any, next: any) => {
  if (c.get) {
    const user = c.get('user');
    if (!user) {
      c.set('user', { id: 'mock-user-cuid', username: 'testuser' });
    }
  }
  await next();
});
