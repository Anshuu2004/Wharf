import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { TextEncoder, TextDecoder } from 'util';
import { Hono } from 'hono';

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

process.env.ENCRYPTION_SECRET = 'thirtytwo_byte_long_secret_key12';
process.env.UPSTASH_REDIS_REST_URL = 'http://localhost';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test';
process.env.DATABASE_URL = 'postgres://localhost:5432/test';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.GITHUB_CLIENT_ID = 'cid';
process.env.GITHUB_CLIENT_SECRET = 'csec';
process.env.JWT_SECRET = 'jwtsec';
process.env.ADMIN_IDS = 'admin1';

// Monkeypatch Hono request to inject process.env automatically during tests
const originalRequest = Hono.prototype.request;
(Hono.prototype as any).request = function(input: any, options?: any, env?: any, executionCtx?: any) {
  return originalRequest.call(this, input, options, env || process.env, executionCtx);
};

beforeAll(() => {});
afterAll(async () => {});
afterEach(() => {
  vi.clearAllMocks();
});
