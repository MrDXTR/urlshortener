// In-memory rate limit store for development
// In production, use Redis or another persistent store
const rateLimitStore = new Map<string, { count: number; reset: number }>();

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

  let record = rateLimitStore.get(key);

  // If no record exists or it has expired, create a new one
  if (!record || record.reset < now) {
    record = { count: 0, reset: now + windowMs };
    rateLimitStore.set(key, record);
  }

  // Increment the count
  record.count += 1;
  rateLimitStore.set(key, record);

  return {
    success: record.count <= max,
    limit: max,
    remaining: Math.max(0, max - record.count),
    reset: record.reset,
  };
}
