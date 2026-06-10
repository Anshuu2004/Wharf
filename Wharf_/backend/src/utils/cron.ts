import cron from 'node-cron';
import { KeyRouterService } from '../services/keyRouter.service';

const keyRouter = new KeyRouterService();

// Initializes All Background Cron Jobs
export function initCronJobs() {
  // Reset Exhausted Keys Every 30 Minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('[CRON] Resetting Exhausted API Keys...');
    try {
      await keyRouter.resetAllExhaustedKeys();
      console.log('[CRON] Successfully Reset All Exhausted Keys.');
    } catch (error) {
      console.error('[CRON] Failed to Reset Exhausted Keys:', error);
    }
  });

  console.log('[CRON] Background jobs initialized.');
}
