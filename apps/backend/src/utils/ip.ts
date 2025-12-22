import { createHash } from "crypto";
import type { Request } from "express";

export const hashIP = (ip: string): string => {
  return createHash("sha256").update(ip).digest("hex").substring(0, 12);
};

export const getClientIP = (req: Request): string => {
  const cfConnectingIP = req.headers["cf-connecting-ip"];
  if (cfConnectingIP) {
    return Array.isArray(cfConnectingIP) ? cfConnectingIP[0] : cfConnectingIP;
  }

  const xForwardedFor = req.headers["x-forwarded-for"];
  if (xForwardedFor) {
    const firstIP = Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : xForwardedFor.split(",")[0].trim();
    return firstIP;
  }

  if (req.ip) {
    return req.ip;
  }

  return req.socket?.remoteAddress || "unknown";
};
