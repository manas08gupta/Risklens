import AppError from "../utils/AppError.js";

const buckets = new Map();

export function rateLimit({ windowMs = 60_000, max = 12 } = {}) {
  return (req, _res, next) => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt <= now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    if (bucket.count > max) {
      return next(new AppError("Too many analysis requests. Please wait before trying again.", 429, "RATE_LIMITED"));
    }

    return next();
  };
}
