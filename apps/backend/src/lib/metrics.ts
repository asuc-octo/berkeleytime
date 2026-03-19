/**
 * Custom application-level OTel metrics.
 *
 * When OTel is not initialized, the metrics API returns no-op instruments,
 * so all counters/histograms are always safe to use.
 */

import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("berkeleytime-backend");

// ── GraphQL ────────────────────────────────────────────────────────────

export const graphqlOperationDuration = meter.createHistogram(
  "graphql.operation.duration",
  {
    description: "Duration of GraphQL operations",
    unit: "ms",
  }
);

export const graphqlOperationCount = meter.createCounter(
  "graphql.operation.count",
  {
    description: "Total number of GraphQL operations",
  }
);

export const graphqlErrorCount = meter.createCounter("graphql.error.count", {
  description: "Total number of GraphQL errors",
});

// ── Feature Usage ──────────────────────────────────────────────────────

export const featureUsageCount = meter.createCounter("feature.usage.count", {
  description: "API usage by feature — derived from GraphQL operation names",
});

// ── Apollo Response Cache ──────────────────────────────────────────────

export const cacheHitCount = meter.createCounter("apollo.cache.hit", {
  description: "Apollo response cache hits",
});

export const cacheMissCount = meter.createCounter("apollo.cache.miss", {
  description: "Apollo response cache misses",
});

// ── Redis KeyValueCache operations ─────────────────────────────────────

export const redisCacheOpDuration = meter.createHistogram(
  "redis.cache.operation.duration",
  {
    description: "Duration of Redis KeyValueCache operations",
    unit: "ms",
  }
);
