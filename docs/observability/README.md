# Observability dashboards and collection

The dashboard JSON under `observability/grafana/dashboards/` is the source of truth. Local Compose mounts that directory into Grafana. Helm reads chart-local files only, so synchronize the source into `infra/observability/dashboards/` before packaging/deploying:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sync-observability-dashboards.ps1
powershell -ExecutionPolicy Bypass -File scripts/sync-observability-dashboards.ps1 -Check
```

Run the local stack with `docker compose -f docker-compose.yml -f docker-compose.observability.yml up --build`. Grafana provisions the stable datasource UIDs `prometheus`, `tempo`, and `loki` and reads dashboards from `/var/lib/grafana/dashboards`.

The Kubernetes chart adds kube-state-metrics and an OpenTelemetry Collector DaemonSet for `/var/log/pods` stdout/stderr. The existing Collector Deployment remains the OTLP gateway. Kube-state metrics are scraped every 15 seconds. The pod log agent checkpoints offsets under `/var/lib/otelcol-podlogs` on each node, reads only the configured namespace's pod log paths, parses container envelopes and JSON, groups multiline records, enriches records through the Kubernetes API, then sends them to Loki. Agent RBAC grants pod metadata reads only in its configured namespace; kube-state-metrics has separate namespace-scoped workload Roles and read-only ClusterRole access to nodes/namespaces.

Before staging deployment, confirm the target nodes expose `/var/log/pods`, the cluster permits hostPath mounts, the service account bindings are accepted, Loki is reachable from the node agent, and the pinned Collector image contains `filelog`, `container`, `recombine`, `json_parser`, `k8sattributes`, and `file_storage`. The selected Collector image is contrib `0.96.0`; verify component availability against that exact image. Kubernetes Events are not collected by this change; the dashboard presents them as unavailable until a separate event receiver is configured.

Local Compose has no Kubernetes API, pod files, or kube-state-metrics workload data. Kubernetes-only panels say so explicitly. Empty or missing telemetry is **Unknown / No data** rather than healthy or zero. Review the metric inventory and runbooks before interpreting a gap.

Pod stdout is ingested from node files by the node agent. Application OTLP log exports continue through the gateway; configure each application log to use only one route. The agent reads existing files from the beginning and checkpoints offsets so previously consumed files resume at their saved positions. Check staging for persistence after pod deletion, rotated files, multiline errors, and agent restarts; downstream delivery is not guaranteed exactly once.
