import { KeyRouterService } from '../services/keyRouter.service';
import { loggerService } from './logger';

// Cloudflare Workers Do Not Support Node-Cron (No process.setInterval-Based Schedulers).
// Use Cloudflare Cron Triggers In wrangler.toml Instead.
// These Functions Are Called From The scheduled() Handler Exported In src/index.ts.

export async function runResetExhaustedKeys(dbUrl: string) {
  const keyRouter = new KeyRouterService(dbUrl);
  const start = Date.now();
  loggerService.cronStarted('ResetExhaustedKeys');
  try {
    await keyRouter.resetAllExhaustedKeys();
    loggerService.cronCompleted('ResetExhaustedKeys', Date.now() - start, 0);
  } catch (error) {
    loggerService.error('cron.failed', 'Failed to Reset Exhausted Keys', error, { job: 'ResetExhaustedKeys' });
  }
}

// Called From The Cloudflare scheduled() Export:
// export const scheduled: ExportedHandlerScheduledHandler<Bindings> = async (event, env, ctx) => {
//   ctx.waitUntil(runResetExhaustedKeys());
// };
