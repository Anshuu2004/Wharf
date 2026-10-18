import { Next } from 'hono';

// Edge-Compatible Rate Limit Placeholder/Passthrough
// For A Production Deployment, We'd Want To Use @upstash/ratelimit 
// Cloudflare Native Rate Limiting Rules Also Provide This At The Network Boundary.

export const rateLimit = async (c: any, next: Next) => {
  await next();
};

export const anonymousAnalysisLimiter = async (c: any, next: Next) => {
  await next();
};
