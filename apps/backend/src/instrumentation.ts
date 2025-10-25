import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

// Get configuration from environment variables
const serviceName = process.env.OTEL_SERVICE_NAME || 'backend';
const collectorEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4317';

// Create a resource with service name
const resource = Resource.default().merge(
  new Resource({
    [ATTR_SERVICE_NAME]: serviceName,
  })
);

// Create the OTLP gRPC exporter
const traceExporter = new OTLPTraceExporter({
  url: collectorEndpoint,
});

// Initialize the SDK
const sdk = new NodeSDK({
  resource: resource,
  traceExporter: traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable fs instrumentation to reduce noise
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
      // Configure HTTP instrumentation
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingRequestHook: (request) => {
          // Ignore health check endpoints
          const url = request.url || '';
          return url.includes('/health') || url.includes('/metrics');
        },
      },
      // Configure Express instrumentation
      '@opentelemetry/instrumentation-express': {
        enabled: true,
      },
      // Configure GraphQL instrumentation
      '@opentelemetry/instrumentation-graphql': {
        enabled: true,
        mergeItems: true,
      },
      // Configure MongoDB instrumentation
      '@opentelemetry/instrumentation-mongodb': {
        enabled: true,
      },
      // Configure Redis instrumentation
      '@opentelemetry/instrumentation-redis-4': {
        enabled: true,
      },
    }),
  ],
});

// Start the SDK
sdk.start();

console.log(`OpenTelemetry initialized for ${serviceName}, sending traces to ${collectorEndpoint}`);

// Gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('OpenTelemetry SDK shut down successfully'))
    .catch((error) => console.error('Error shutting down OpenTelemetry SDK', error))
    .finally(() => process.exit(0));
});
