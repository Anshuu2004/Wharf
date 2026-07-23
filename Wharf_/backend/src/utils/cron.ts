import cron from 'node-cron';
import { KeyRouterService } from '../services/keyRouter.service';
import { loggerService } from './logger';

const keyRouter = new KeyRouterService();

// Initializes All Background Cron Jobs
export function initCronJobs() {
  // Reset Exhausted Keys Every 30 Minutes
  cron.schedule('*/30 * * * *', async () => {
    const start = Date.now();
    loggerService.cronStarted('ResetExhaustedKeys');
    try {
      await keyRouter.resetAllExhaustedKeys();
      loggerService.cronCompleted('ResetExhaustedKeys', Date.now() - start, 0);
    } catch (error) {
      loggerService.error('cron.failed', 'Failed to Reset Exhausted Keys', error, { job: 'ResetExhaustedKeys' });
    }
  });

  loggerService.info('cron.initialized', 'Background jobs initialized.');
}
