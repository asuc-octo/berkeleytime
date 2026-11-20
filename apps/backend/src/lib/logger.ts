/**
 * Structured JSON logger (pino) with OTel trace context.
 *
 * Every log line automatically includes traceId and spanId from the
 * active OTel span (if any). When OTel is not initialized the mixin
 * returns an empty object — no overhead.
 *
 * Usage:
 *   import log from "../lib/logger";
 *   log.info({ key: "value" }, "something happened");
 *   const child = log.child({ module: "apollo" });
 */

import pino from "pino";
import { trace } from "@opentelemetry/api";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  mixin() {
    const span = trace.getActiveSpan();
    if (!span) return {};
    const ctx = span.spanContext();
    return {
      traceId: ctx.traceId,
      spanId: ctx.spanId,
    };
  },
});

export default logger;
