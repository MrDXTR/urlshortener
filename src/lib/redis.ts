import { Redis } from "@upstash/redis";
import { env } from "~/env";

// Create Redis client instance
const createRedisClient = () => {
  return new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
};

// Global Redis client instance (similar to Prisma pattern)
const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createRedisClient> | undefined;
};

export const redis = globalForRedis.redis ?? createRedisClient();

if (env.NODE_ENV !== "production") globalForRedis.redis = redis;

// Redis utility functions
export class RedisService {
  private static instance: RedisService;
  private client: Redis;

  private constructor() {
    this.client = redis;
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  // Rate limiting methods
  async incrementWithExpiry(key: string, expirySeconds: number): Promise<number> {
    const pipeline = this.client.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, expirySeconds);
    const results = await pipeline.exec();
    return results?.[0]?.result as number ?? 0;
  }

  async getWithExpiry(key: string): Promise<{ value: number; ttl: number } | null> {
    const pipeline = this.client.pipeline();
    pipeline.get(key);
    pipeline.ttl(key);
    const results = await pipeline.exec();
    
    const value = results?.[0]?.result;
    const ttl = results?.[1]?.result as number;
    
    if (value === null || value === undefined) return null;
    
    return {
      value: Number(value),
      ttl: ttl > 0 ? ttl : 0,
    };
  }

  // Caching methods
  async setWithExpiry(key: string, value: string, expirySeconds: number): Promise<void> {
    await this.client.setex(key, expirySeconds, value);
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === "PONG";
    } catch (error) {
      console.error("Redis ping failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const redisService = RedisService.getInstance();
