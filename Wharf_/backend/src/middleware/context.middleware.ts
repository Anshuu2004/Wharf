import { Next } from 'hono';

export const contextMiddleware = async (c: any, next: Next) => {
  const store = {
    requestId: c.get('requestId') || 'system',
  };
  c.set('contextStore', store);
  await next();
};
