// Edge-compatible logger — replaces pino/pino-http which requires Node.js streams

let _prisma: any = null;

async function getDbPrisma() {
  if (!_prisma) {
    const { getPrisma } = await import('../db');
    const url = process.env.DATABASE_URL;
    if (url) _prisma = getPrisma(url);
  }
  return _prisma;
}

export const saveRequestLog = async (logData: {
  route: string;
  method: string;
  feature?: string;
  finalProvider?: string;
  fallbackUsed?: boolean;
  totalDurationMs?: number;
  statusCode?: number;
  cacheHit?: boolean;
  error?: string;
  targetUsername?: string;
  targetRepo?: string;
}) => {
  try {
    const prisma = await getDbPrisma();
    if (!prisma) return;
    await (prisma as any).requestLog.create({ data: logData });
  } catch (_err) {
    // Silently swallow log DB errors to never disrupt request flow
  }
};

class LoggerService {
  info(event: string, msg: string, data?: any) {
    console.log(`[INFO] [${event}] ${msg}`, data ?? '');
  }

  warn(event: string, msg: string, data?: any) {
    console.warn(`[WARN] [${event}] ${msg}`, data ?? '');
  }

  error(event: string, msg: string, err: any, data?: any) {
    console.error(`[ERROR] [${event}] ${msg}`, err, data ?? '');
  }

  cacheHit(repo: string, metadata?: any) {
    this.info('cache.hit', 'Cache Hit', { repository: repo, ...metadata });
  }

  cacheMiss(repo: string, metadata?: any) {
    this.info('cache.miss', 'Cache Miss', { repository: repo, ...metadata });
  }

  githubFetchStarted(repo: string, metadata?: any) {
    this.info('github.fetch.started', 'GitHub Fetch Started', { repository: repo, ...metadata });
  }

  githubFetchCompleted(repo: string, durationMs: number, metadata?: any) {
    this.info('github.fetch.completed', 'GitHub Fetch Completed', { repository: repo, durationMs, ...metadata });
  }

  githubFetchError(repo: string, err: any, metadata?: any) {
    this.error('github.fetch.error', 'GitHub Fetch Failed', err, { repository: repo, ...metadata });
  }

  providerSelected(provider: string, metadata?: any) {
    this.info('provider.selected', `Provider Selected: ${provider}`, { provider, ...metadata });
  }

  providerStarted(provider: string, metadata?: any) {
    this.info('provider.started', `Provider Generation Started: ${provider}`, { provider, ...metadata });
  }

  providerCompleted(provider: string, durationMs: number, metadata?: any) {
    this.info('provider.completed', `Provider Generation Completed: ${provider}`, { provider, durationMs, ...metadata });
  }

  providerFailed(provider: string, err: any, metadata?: any) {
    this.error('provider.failed', `Provider Generation Failed: ${provider}`, err, { provider, ...metadata });
  }

  providerFallback(failedProvider: string, nextProvider: string, err: any, metadata?: any) {
    this.warn('provider.fallback', `Fallback from ${failedProvider} to ${nextProvider}`, { failedProvider, nextProvider, err, ...metadata });
  }

  databaseSave(durationMs: number, metadata?: any) {
    this.info('database.save.completed', 'Database Save Completed', { durationMs, ...metadata });
  }

  cronStarted(job: string, metadata?: any) {
    this.info('cron.started', `Cron Job started: ${job}`, { job, ...metadata });
  }

  cronCompleted(job: string, durationMs: number, processedCount: number, metadata?: any) {
    this.info('cron.completed', `Cron Job completed: ${job}`, { job, durationMs, processedCount, ...metadata });
  }

  /** Returns A Timestamp To Be Passed To stepEnd() */
  stepStart(): number {
    return Date.now();
  }

  /** Logs A Structured Event With Auto-Computed Duration Ms */
  stepEnd(event: string, msg: string, startMs: number, data?: any) {
    this.info(event, msg, { durationMs: Date.now() - startMs, ...data });
  }
}

export const loggerService = new LoggerService();
