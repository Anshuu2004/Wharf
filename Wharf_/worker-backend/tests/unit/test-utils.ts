import { vi } from 'vitest';

export function createMockContext(req: any = {}, env: any = {}, user: any = undefined) {
  const store = new Map<string, any>();
  return {
    req: {
      json: vi.fn().mockResolvedValue(req.body || {}),
      query: (key: string) => (req.query ? req.query[key] : undefined),
      param: (key: string) => (req.params ? req.params[key] : undefined),
      header: (key: string) => (req.headers ? req.headers[key] : undefined),
      path: req.path || '/',
      method: req.method || 'GET',
      raw: {
        headers: {
          get: (key: string) => req.headers ? (req.headers[key] || req.headers[key.toLowerCase()]) : null
        }
      }
    },
    env: { ...env },
    get: vi.fn((key: string) => {
      if (store.has(key)) return store.get(key);
      if (key === 'user') return user;
      return undefined;
    }),
    set: vi.fn((key: string, value: any) => {
      store.set(key, value);
    }),
    json: vi.fn().mockImplementation((data, status) => {
      return { _isHonoResponse: true, data, status: status || 200 };
    }),
    redirect: vi.fn().mockImplementation((url, status) => {
      return { _isHonoRedirect: true, url, status: status || 302 };
    }),
    header: vi.fn(),
  } as any;
}
