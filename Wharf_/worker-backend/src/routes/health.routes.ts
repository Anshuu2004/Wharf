import { Hono } from 'hono';
import { HealthController } from '../controllers/health.controller';
import { auth, requireAuth } from '../middleware/auth.middleware';
import { Bindings } from '../index';

export const healthRoutes = new Hono<{ Bindings: Bindings }>();
const healthController = new HealthController();

// Basic Cloudflare/Hono Rate Limiting Example:
// Full Rate Limiting Is Ideally Handled At The Cloudflare Layer Via WAF Rules Or Workers KV / Durable Objects.
// For Now, Removing `express-rate-limit` Dependency Since It's Incompatible With Edge.

healthRoutes.post('/score', auth, healthController.analyzeReadmeHealth.bind(healthController) as any);
healthRoutes.post('/contribution', auth, healthController.analyzeContributionReadiness.bind(healthController) as any);

// Protected Routes
healthRoutes.get('/history', auth, requireAuth, healthController.getHistory.bind(healthController) as any);
healthRoutes.delete('/history/:id', auth, requireAuth, healthController.deleteHistory.bind(healthController) as any);
