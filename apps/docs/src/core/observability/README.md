# Observability

<!-- toc -->

## What is collected

Both the backend and the frontend are instrumented with OpenTelemetry (OTel):

- **Backend** (`apps/backend/src/instrumentation.ts`): traces, metrics and logs exported over OTLP/HTTP when `OTEL_EXPORTER_OTLP_ENDPOINT` is set. It must be the first import in `main.ts` so the SDK can patch `http` before Express and Mongoose load. Custom instruments live in `src/lib/metrics.ts` (GraphQL operation counts and durations, cache hits, persisted-operation rejections, feature usage).
- **Frontend** (`apps/frontend/src/instrumentation.ts`): browser traces (page views, fetch) exported to `/otlp`, which nginx/ingress forwards to the collector, when `VITE_OTEL_ENDPOINT` is set at build time (the production image build sets it).
- **Infrastructure**: the collector scrapes nginx `stub_status` and MongoDB server metrics.

## The stack

```
backend / frontend --OTLP--> otel-collector --> Tempo (traces, 24h)
                                            --> Loki (logs, 24h)
                                            --> Prometheus (metrics) --> Grafana
```

- Production: Helm chart `infra/observability` (collector, Tempo, Loki, Prometheus, Grafana with provisioned datasources). Deploy or update it by running "CD: Deploy to Production" with `deploy_observability` checked. Memory limits and ingestion caps are deliberately tight because everything shares one node; see the comments in `infra/observability/values.yaml` before raising them.
- Local: `docker compose -f docker-compose.yml -f docker-compose.observability.yml up --build` adds the same stack; configs live in `observability/`. Grafana is on port 3012 by default, Loki on 3011.

## Where to look when something is wrong

1. Grafana dashboards (production ingress host in `infra/observability/templates/ingress.yaml`).
2. `kubectl -n bt logs deploy/bt-prod-app-backend` for raw pino JSON logs.
3. Backend `/healthz` and semantic-search `/health` for readiness.
