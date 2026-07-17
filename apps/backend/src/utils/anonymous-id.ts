import { randomBytes } from "crypto";
import type { NextFunction, Request, Response } from "express";

import { config } from "../../../../packages/common/src/utils/config";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      anonymousId?: string;
    }
  }
}

const ANONYMOUS_ID_COOKIE = "bt.aid";
const ANONYMOUS_ID_TTL_MS = 1000 * 60 * 60 * 24 * 365;

// 16 random bytes, hex-encoded
const ANONYMOUS_ID_PATTERN = /^[a-f0-9]{32}$/;

const parseAnonymousIdCookie = (
  cookieHeader: string | undefined
): string | null => {
  if (!cookieHeader) return null;

  const value = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ANONYMOUS_ID_COOKIE}=`))
    ?.slice(ANONYMOUS_ID_COOKIE.length + 1);

  if (!value || !ANONYMOUS_ID_PATTERN.test(value)) return null;

  return value;
};

/**
 * Assigns every visitor a stable, opaque browser ID via a cookie, without
 * creating a server-side session. Used as the identity input for view-count
 * dedupe fingerprints, replacing the Redis-backed anonymous sessions that
 * `saveUninitialized: true` used to create.
 */
export const anonymousIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let anonymousId = parseAnonymousIdCookie(req.headers.cookie);

  if (!anonymousId) {
    anonymousId = randomBytes(16).toString("hex");

    res.cookie(ANONYMOUS_ID_COOKIE, anonymousId, {
      secure: !config.isDev,
      httpOnly: true,
      maxAge: ANONYMOUS_ID_TTL_MS,
      sameSite: "lax",
      domain: config.isDev ? undefined : ".berkeleytime.com",
    });
  }

  req.anonymousId = anonymousId;

  next();
};

export const getAnonymousId = (req: Request): string | null =>
  req.anonymousId ?? parseAnonymousIdCookie(req.headers.cookie);
