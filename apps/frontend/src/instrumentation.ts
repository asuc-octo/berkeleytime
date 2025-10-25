import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

// Get configuration from environment variables (set via Vite)
const collectorUrl = import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';
const serviceName = import.meta.env.VITE_OTEL_SERVICE_NAME || 'frontend';

// Create a resource with service name
const resource = Resource.default().merge(
  new Resource({
    [ATTR_SERVICE_NAME]: serviceName,
  })
);

// Create the OTLP exporter for traces
const exporter = new OTLPTraceExporter({
  url: collectorUrl,
  headers: {},
});

// Create the tracer provider
const provider = new WebTracerProvider({
  resource: resource,
});

// Add the batch span processor with the OTLP exporter
provider.addSpanProcessor(new BatchSpanProcessor(exporter));

// Register the provider
provider.register();

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

console.log(`OpenTelemetry initialized for ${serviceName}, sending traces to ${collectorUrl}`);
