import { redisService } from "./redis";

// Fallback in-memory store for when Redis is unavailable
const fallbackStore = new Map<string, { count: number; reset: number }>();

type RateLimitOptions = {
  max: number;
  windowMs: number; // Time window in milliseconds
};

export async function rateLimit(
  identifier: string,
  { max, windowMs }: RateLimitOptions,
) {
  const now = Date.now();
  const key = `rate-limit:${identifier}`;
  const windowSeconds = Math.ceil(windowMs / 1000);

  try {
    const currentCount = await redisService.incrementWithExpiry(key, windowSeconds);
    
    return {
      success: currentCount <= max,
      limit: max,
      remaining: Math.max(0, max - currentCount),
      reset: now + windowMs,
    };
  } catch (error) {
    console.warn("Redis rate limiting failed, falling back to in-memory store:", error);
    
    // Fallback to in-memory store
    let record = fallbackStore.get(key);

    // If no record exists or it has expired, create a new one
    if (!record || record.reset < now) {
      record = { count: 0, reset: now + windowMs };
      fallbackStore.set(key, record);
    }

    // Increment the count
    record.count += 1;
    fallbackStore.set(key, record);

    return {
      success: record.count <= max,
      limit: max,
      remaining: Math.max(0, max - record.count),
      reset: record.reset,
    };
  }
}
