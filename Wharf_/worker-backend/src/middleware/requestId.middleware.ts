import { Next } from 'hono';
import { v4 as uuidv4 } from 'uuid';

export const requestIdMiddleware = async (c: any, next: Next) => {
  const reqId = c.req.header('x-request-id') || uuidv4();
  c.set('requestId', reqId);
  c.header('X-Request-Id', reqId);
  await next();
};
