/**
 * Custom application-level OTel metrics.
 *
 * When OTel is not initialized, the metrics API returns no-op instruments,
 * so all counters/histograms are always safe to use.
 */
import { metrics } from "@opentelemetry/api";
import { monitorEventLoopDelay } from "perf_hooks";

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

// ── Process health (event-loop lag + memory) ───────────────────────────
//
// Self-contained runtime signals using only Node built-ins, so they report
// even before @opentelemetry/instrumentation-runtime-node is installed.
// A periodic spike in event-loop lag that lines up with /healthz readiness
// failures confirms the loop is being blocked (GC pause or synchronous CPU
// work) rather than a slow Mongo/Redis dependency.

// Histogram of event-loop delay sampled every 20ms; read + reset each export.
const eventLoopDelay = monitorEventLoopDelay({ resolution: 20 });
eventLoopDelay.enable();

const NS_PER_MS = 1e6;

const eventLoopLagMax = meter.createObservableGauge(
  "process.eventloop.lag.max",
  {
    description: "Max event-loop delay since last collection",
    unit: "ms",
  }
);

const eventLoopLagP99 = meter.createObservableGauge(
  "process.eventloop.lag.p99",
  {
    description: "p99 event-loop delay since last collection",
    unit: "ms",
  }
);

// Single batched callback so both gauges read the same snapshot before reset
// (per-instrument callback order is not guaranteed).
meter.addBatchObservableCallback(
  (result) => {
    result.observe(eventLoopLagMax, eventLoopDelay.max / NS_PER_MS);
    result.observe(eventLoopLagP99, eventLoopDelay.percentile(99) / NS_PER_MS);
    // Reset so each export window reflects only that interval.
    eventLoopDelay.reset();
  },
  [eventLoopLagMax, eventLoopLagP99]
);

meter
  .createObservableGauge("process.memory.heap_used", {
    description: "V8 heap used",
    unit: "By",
  })
  .addCallback((result) => {
    result.observe(process.memoryUsage().heapUsed);
  });

meter
  .createObservableGauge("process.memory.rss", {
    description: "Resident set size",
    unit: "By",
  })
  .addCallback((result) => {
    result.observe(process.memoryUsage().rss);
  });
