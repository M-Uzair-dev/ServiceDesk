"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.defaultLimiter = void 0;
exports.slidingWindowRateLimiter = slidingWindowRateLimiter;
const redis_1 = require("../config/redis");
// Sliding window rate limiter using Redis sorted sets.
// Each request is stored as a member with its timestamp as score.
// We then count members within the current window to decide whether to allow.
function slidingWindowRateLimiter(options) {
    const { windowMs, max, keyPrefix = "rl" } = options;
    return async (req, res, next) => {
        const ip = req.ip ?? "unknown";
        const key = `${keyPrefix}:${ip}`;
        const now = Date.now();
        const windowStart = now - windowMs;
        try {
            const pipeline = redis_1.redis.pipeline();
            // remove entries outside the window
            pipeline.zremrangebyscore(key, "-inf", windowStart);
            // add this request
            pipeline.zadd(key, now, `${now}-${Math.random()}`);
            // count requests in window
            pipeline.zcard(key);
            // expire the key after the window so it cleans up naturally
            pipeline.pexpire(key, windowMs);
            const results = await pipeline.exec();
            const count = results?.[2]?.[1] ?? 0;
            res.setHeader("X-RateLimit-Limit", max);
            res.setHeader("X-RateLimit-Remaining", Math.max(0, max - count));
            if (count > max) {
                res.status(429).json({ success: false, error: "Too many requests, slow down." });
                return;
            }
            next();
        }
        catch (err) {
            // if Redis is down, let the request through rather than blocking the app
            next();
        }
    };
}
exports.defaultLimiter = slidingWindowRateLimiter({ windowMs: 60000, max: 60 });
exports.authLimiter = slidingWindowRateLimiter({ windowMs: 60000, max: 10, keyPrefix: "rl:auth" });
//# sourceMappingURL=rateLimiter.js.map