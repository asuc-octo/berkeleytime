/**
 * OpenTelemetry browser instrumentation bootstrap.
 *
 * Import this module as the FIRST import in main.tsx so the SDK can
 * patch fetch/XMLHttpRequest before Apollo Client or other code uses them.
 *
 * When VITE_OTEL_ENDPOINT is not set, this module is a no-op.
 */

import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { Resource } from "@opentelemetry/resources";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { getWebAutoInstrumentations } from "@opentelemetry/auto-instrumentations-web";

const otelEndpoint = import.meta.env.VITE_OTEL_ENDPOINT;

if (otelEndpoint) {
  const resource = new Resource({
    "service.name": "frontend",
    "service.version": "0.1.0",
    "deployment.environment": "local",
  });

  const provider = new WebTracerProvider({
    resource,
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: `${window.location.origin}${otelEndpoint}/v1/traces`,
        })
      ),
    ],
  });

  provider.register({
    contextManager: new ZoneContextManager(),
  });

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      getWebAutoInstrumentations({
        "@opentelemetry/instrumentation-document-load": {
          enabled: true,
        },
        "@opentelemetry/instrumentation-fetch": {
          // Propagate traceparent on API calls (same-origin through nginx)
          propagateTraceHeaderCorsUrls: [/\/api\/.*/],
          clearTimingResources: true,
        },
        "@opentelemetry/instrumentation-xml-http-request": {
          propagateTraceHeaderCorsUrls: [/\/api\/.*/],
        },
        "@opentelemetry/instrumentation-user-interaction": {
          enabled: true,
        },
      }),
    ],
  });

  console.log(`[otel] Browser SDK initialized — exporting to ${otelEndpoint}`);
}
