import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: ReturnType<typeof createClient> | null = null;
let isRedisConnected = false;

// In-Memory Fallback Cache For Development
const localCache = new Map<
  string,
  {
    value: string;
    expiresAt: number;
  }
>();

export const getRedisClient = () => {
  if (redisClient) return redisClient;

  redisClient = createClient({
    url: REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          console.warn('[Redis] Max reconnect attempts reached. Falling back to in-memory store.');

          isRedisConnected = false;

          return false; // Stop Reconnecting
        }

        return Math.min(retries * 500, 2000);
      },
    },
  });

  redisClient.on('error', (err) => {
    console.error('[Redis] Client Connection Error:', err.message);
    isRedisConnected = false;
  });

  redisClient.on('connect', () => {
    console.log('[Redis] Connected successfully');
    isRedisConnected = true;
  });

  redisClient.connect().catch((err) => {
    console.error('[Redis] Failed to connect:', err.message);
    isRedisConnected = false;
  });

  return redisClient;
};

// Auto-Init Connection
if (process.env.NODE_ENV !== 'test' && (process.env.REDIS_URL || process.env.NODE_ENV === 'production')) {
  getRedisClient();
}

export const closeRedisClient = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    isRedisConnected = false;
  }
};

export let globalCacheHits = 0;
export let globalCacheMisses = 0;

/* Cache GET Utility With Local In-Memory Fallback */
export async function cacheGet(key: string): Promise<string | null> {
  if (isRedisConnected && redisClient) {
    try {
      const val = await redisClient.get(key);
      if (val) globalCacheHits++;
      else globalCacheMisses++;
      return val;
    } catch (err: any) {
      console.error('[Redis Cache] Get failed, using fallback:', err.message);
    }
  }

  // Fallback To Local Memory
  const cached = localCache.get(key);

  if (!cached) {
    globalCacheMisses++;
    return null;
  }

  if (Date.now() > cached.expiresAt) {
    localCache.delete(key);
    globalCacheMisses++;
    return null;
  }

  globalCacheHits++;
  return cached.value;
}

export function getCacheStats() {
  const total = globalCacheHits + globalCacheMisses;
  const hitRate = total === 0 ? 0 : Math.round((globalCacheHits / total) * 100);
  return {
    hitRate,
    missRate: total === 0 ? 0 : 100 - hitRate,
    size: localCache.size,
  };
}

/* Cache SET Utility With Local In-Memory Fallback */
export async function cacheSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.set(key, value, {
        EX: ttlSeconds,
      });

      return;
    } catch (err: any) {
      console.error('[Redis Cache] Set failed, using fallback:', err.message);
    }
  }

  // Fallback To Local Memory
  localCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/* Check If Redis Is Actively Connected */
export function checkRedisStatus(): boolean {
  return isRedisConnected;
}
