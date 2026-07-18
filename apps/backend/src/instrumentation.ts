/**
 * OpenTelemetry instrumentation bootstrap.
 *
 * IMPORTANT: This module must be imported BEFORE any other application code
 * so that OTel can patch Node.js built-ins (http, net, dns) before they
 * are loaded by Express, Mongoose, etc.
 *
 * Since tsx compiles to CJS, static imports here become synchronous
 * require() calls — the SDK registers hooks before the importing module
 * continues to require express/http/etc.
 *
 * When OTEL_EXPORTER_OTLP_ENDPOINT is not set the SDK is never started
 * and the OTel API returns no-ops, so there is no runtime overhead beyond
 * the initial module load.
 */

import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { Resource } from "@opentelemetry/resources";

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

if (endpoint) {
  const resource = new Resource({
    "service.name": process.env.OTEL_SERVICE_NAME || "backend",
    "service.version": process.env.SERVICE_VERSION || "0.1.0",
    "deployment.environment":
      process.env.DEPLOYMENT_ENVIRONMENT || "local",
  });

  const sdk = new NodeSDK({
    resource,
    traceExporter: new OTLPTraceExporter({
      url: `${endpoint}/v1/traces`,
    }),
    logRecordProcessor: new BatchLogRecordProcessor(
      new OTLPLogExporter({ url: `${endpoint}/v1/logs` })
    ),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${endpoint}/v1/metrics`,
      }),
      exportIntervalMillis: 15_000,
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        // Instrument HTTP requests (Express runs on http module)
        "@opentelemetry/instrumentation-http": {
          ignoreIncomingRequestHook: (req) => {
            const url = req.url || "";
            // Skip health checks to reduce noise
            return url === "/healthz" || url === "/health" || url === "/ready";
          },
        },
        // GraphQL resolver-level tracing
        "@opentelemetry/instrumentation-graphql": {
          mergeItems: true,
          allowValues: true,
        },
        // Mongoose / MongoDB tracing (auto-detected)
        "@opentelemetry/instrumentation-mongoose": {},
        // Disable noisy low-value instrumentations
        "@opentelemetry/instrumentation-fs": { enabled: false },
        "@opentelemetry/instrumentation-dns": { enabled: false },
        "@opentelemetry/instrumentation-net": { enabled: false },
      }),
    ],
  });

  sdk.start();
  console.log(`[otel] SDK initialized — exporting to ${endpoint}`);

  // Graceful shutdown flushes pending spans/metrics
  const shutdown = () => {
    sdk.shutdown().then(
      () => console.log("[otel] SDK shut down successfully"),
      (err) => console.error("[otel] Error during SDK shutdown", err)
    );
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
