import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

// Get configuration from environment variables (set via Vite)
const traceCollectorUrl = import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';
const metricsCollectorUrl = import.meta.env.VITE_OTEL_METRICS_ENDPOINT || 'http://localhost:4318/v1/metrics';
const serviceName = import.meta.env.VITE_OTEL_SERVICE_NAME || 'frontend';

// Create a resource with service name
const resource = Resource.default().merge(
  new Resource({
    [ATTR_SERVICE_NAME]: serviceName,
  })
);

// ========== TRACES SETUP ==========
// Create the OTLP exporter for traces
const traceExporter = new OTLPTraceExporter({
  url: traceCollectorUrl,
  headers: {},
});

// Create the tracer provider
const tracerProvider = new WebTracerProvider({
  resource: resource,
});

// Add the batch span processor with the OTLP exporter
tracerProvider.addSpanProcessor(new BatchSpanProcessor(traceExporter));

// Register the tracer provider
tracerProvider.register();

// ========== METRICS SETUP ==========
// Create the OTLP exporter for metrics
const metricExporter = new OTLPMetricExporter({
  url: metricsCollectorUrl,
  headers: {},
});

// Create a metric reader that exports every 30 seconds
const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 30000, // Export every 30 seconds
});

// Create and register the meter provider
const meterProvider = new MeterProvider({
  resource: resource,
  readers: [metricReader],
});

// Register as the global meter provider (required for instrumentations to create metrics)
import { metrics } from '@opentelemetry/api';
metrics.setGlobalMeterProvider(meterProvider);

// Register instrumentations
registerInstrumentations({
  instrumentations: [
    new DocumentLoadInstrumentation(),
    new FetchInstrumentation({
      // Ignore internal telemetry requests
      ignoreUrls: [/localhost:4318/, /otel-collector/],
      propagateTraceHeaderCorsUrls: [
        /.*/,  // Propagate trace context to all origins
      ],
      clearTimingResources: true,
    }),
    new XMLHttpRequestInstrumentation({
      ignoreUrls: [/localhost:4318/, /otel-collector/],
      propagateTraceHeaderCorsUrls: [
        /.*/,
      ],
    }),
    new UserInteractionInstrumentation({
      eventNames: ['click', 'submit'],
    }),
  ],
});

console.log(`OpenTelemetry initialized for ${serviceName}`);
console.log(`  - Traces: ${traceCollectorUrl}`);
console.log(`  - Metrics: ${metricsCollectorUrl} (exported every 30s)`);
