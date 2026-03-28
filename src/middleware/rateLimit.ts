import { Request, Response, NextFunction } from "express";
import { fail } from "../lib/response";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Simple in-memory rate limiter.
 * For hackathon use — replace with Redis or express-rate-limit in production.
 */
export function rateLimit(opts: {
  windowMs: number;  // milliseconds
  max: number;       // max requests per window
  keyFn?: (req: Request) => string;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = opts.keyFn ? opts.keyFn(req) : (req.body?.userId ?? req.ip ?? "anon");
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + opts.windowMs };
      store.set(key, entry);
    }

    entry.count++;

    if (entry.count > opts.max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      fail(res, `Too many requests — try again in ${retryAfter}s`, 429);
      return;
    }

    next();
  };
}

// Prune old entries every 5 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);
