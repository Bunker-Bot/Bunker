import { config } from './config.ts';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * In-Memory Rate Limiter (10 requests per minute per administrator)
 */
export function checkRateLimit(userId: string): { isLimited: boolean; remaining: number } {
  const now = Date.now();
  const userRecord = rateLimitStore.get(userId);

  if (!userRecord || now > userRecord.resetAt) {
    rateLimitStore.set(userId, {
      count: 1,
      resetAt: now + config.rateLimitWindowMs,
    });
    return { isLimited: false, remaining: config.rateLimitRequests - 1 };
  }

  if (userRecord.count >= config.rateLimitRequests) {
    return { isLimited: true, remaining: 0 };
  }

  userRecord.count += 1;
  rateLimitStore.set(userId, userRecord);

  return { isLimited: false, remaining: config.rateLimitRequests - userRecord.count };
}
