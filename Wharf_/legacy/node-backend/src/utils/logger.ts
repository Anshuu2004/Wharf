import pino from 'pino';
import pinoHttp from 'pino-http';
import prisma from '../db';
import { randomUUID } from 'crypto';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'password',
      'token',
      'githubAccessToken',
      'installationId',
    ],
    censor: '[REDACTED]',
  },
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
});

import { getContextData } from './asyncContext';

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
    const ctx = getContextData();
    await (prisma as any).requestLog.create({
      data: {
        ...logData,
        requestId: ctx.requestId,
        userId: ctx.userId,
        appUsername: ctx.username,
      },
    });
  } catch (err) {
    logger.error({ err }, 'Failed to persist request log to DB');
  }
};

class LoggerService {
  private formatLog(event: string, data?: any) {
    const ctx = getContextData();
    return {
      event,
      requestId: ctx.requestId,
      userId: ctx.userId,
      username: ctx.username,
      ...data,
    };
  }

  info(event: string, msg: string, data?: any) {
    logger.info(this.formatLog(event, data), msg);
  }

  warn(event: string, msg: string, data?: any) {
    logger.warn(this.formatLog(event, data), msg);
  }

  error(event: string, msg: string, err: any, data?: any) {
    logger.error(this.formatLog(event, { err, ...data }), msg);
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
    this.info('github.fetch.completed', 'GitHub Fetch Completed', {
      repository: repo,
      durationMs,
      ...metadata,
    });
  }

  githubFetchError(repo: string, err: any, metadata?: any) {
    this.error('github.fetch.error', 'GitHub Fetch Failed', err, { repository: repo, ...metadata });
  }

  providerSelected(provider: string, metadata?: any) {
    this.info('provider.selected', `Provider Selected: ${provider}`, { provider, ...metadata });
  }

  providerStarted(provider: string, metadata?: any) {
    this.info('provider.started', `Provider Generation Started: ${provider}`, {
      provider,
      ...metadata,
    });
  }

  providerCompleted(provider: string, durationMs: number, metadata?: any) {
    this.info('provider.completed', `Provider Generation Completed: ${provider}`, {
      provider,
      durationMs,
      ...metadata,
    });
  }

  providerFailed(provider: string, err: any, metadata?: any) {
    this.error('provider.failed', `Provider Generation Failed: ${provider}`, err, {
      provider,
      ...metadata,
    });
  }

  providerFallback(failedProvider: string, nextProvider: string, err: any, metadata?: any) {
    this.warn('provider.fallback', `Fallback from ${failedProvider} to ${nextProvider}`, {
      failedProvider,
      nextProvider,
      err,
      ...metadata,
    });
  }

  databaseSave(durationMs: number, metadata?: any) {
    this.info('database.save.completed', 'Database Save Completed', { durationMs, ...metadata });
  }

  cronStarted(job: string, metadata?: any) {
    this.info('cron.started', `Cron Job started: ${job}`, { job, ...metadata });
  }

  cronCompleted(job: string, durationMs: number, processedCount: number, metadata?: any) {
    this.info('cron.completed', `Cron Job completed: ${job}`, {
      job,
      durationMs,
      processedCount,
      ...metadata,
    });
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
