import type { RequestHandler } from "express";
import type { RedisClientType } from "redis";

const REFRESH_RATE_LIMIT_KEY = "semantic-search:refresh-rate-limit";
const REFRESH_RATE_LIMIT_SECONDS = 5 * 60;

export const requireStaffRefreshAccess: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const isStaff = (req.user as { staff?: boolean } | undefined)?.staff === true;
  if (!isStaff) {
    res.status(403).json({ error: "Staff access required" });
    return;
  }

  next();
};

export const createRefreshRateLimit = (
  redis: Pick<RedisClientType, "set" | "ttl">
): RequestHandler => {
  return async (_req, res, next) => {
    try {
      const acquired = await redis.set(REFRESH_RATE_LIMIT_KEY, "1", {
        NX: true,
        EX: REFRESH_RATE_LIMIT_SECONDS,
      });

      if (acquired) {
        next();
        return;
      }

      const ttl = await redis.ttl(REFRESH_RATE_LIMIT_KEY);
      res.setHeader("Retry-After", String(Math.max(ttl, 1)));
      res.status(429).json({
        error: "A semantic search refresh was requested recently",
      });
    } catch (error) {
      console.error("Semantic search refresh rate limit error:", error);
      res.status(503).json({ error: "Unable to authorize semantic refresh" });
    }
  };
};
