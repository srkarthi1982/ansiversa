import type { MiddlewareHandler } from 'hono';

/**
 * Simple in-memory rate limiter by IP: max N requests per window.
 * For multi-instance deployments, replace with Redis or another shared store.
 */
type Counter = { count: number; resetAt: number };
const buckets = new Map<string, Counter>();

export function rateLimit({ windowMs = 60_000, max = 60 } = {}): MiddlewareHandler {
  return async (c, next) => {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || c.req.raw.headers.get('cf-connecting-ip') || 'unknown';
    const now = Date.now();
    const bucket = buckets.get(ip) ?? { count: 0, resetAt: now + windowMs };

    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(ip, bucket);

    const remaining = Math.max(0, max - bucket.count);
    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(remaining));
    c.header('X-RateLimit-Reset', String(Math.floor(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      return c.json({ error: 'Too Many Requests' }, 429);
    }

    await next();
  };
}
