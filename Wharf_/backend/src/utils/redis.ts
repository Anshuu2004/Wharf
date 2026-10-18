import { Redis } from '@upstash/redis';

// Local dev memory fallback when Upstash isn't active
const localCache = new Map<string, { value: string; expiresAt: number }>();

export let globalCacheHits = 0;
export let globalCacheMisses = 0;

function getUpstashClient() {
  // Rely on nodejs_compat injecting process.env
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (url && token) {
    return new Redis({
      url,
      token,
    });
  }
  return null;
}

export async function cacheGet(key: string): Promise<string | null> {
  const client = getUpstashClient();
  
  if (client) {
    try {
      const val = await client.get<string | null>(key);
      if (val) globalCacheHits++;
      else globalCacheMisses++;
      return typeof val === 'string' ? val : JSON.stringify(val);
    } catch (err: any) {
      console.error('[Redis Cache] Get failed, using fallback:', err.message);
    }
  }

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

export async function cacheSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  const client = getUpstashClient();
  
  if (client) {
    try {
      await client.set(key, value, { ex: ttlSeconds });
      return;
    } catch (err: any) {
      console.error('[Redis Cache] Set failed, using fallback:', err.message);
    }
  }

  localCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export function getCacheStats() {
  const total = globalCacheHits + globalCacheMisses;
  const hitRate = total === 0 ? 0 : Math.round((globalCacheHits / total) * 100);
  return { hitRate, missRate: total === 0 ? 0 : 100 - hitRate, size: localCache.size };
}
