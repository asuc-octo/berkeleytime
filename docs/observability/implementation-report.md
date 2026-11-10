# Kubernetes workloads dashboard: implementation report

## Scope

The deliverable is a single dashboard, `workloads.json`, plus only the configuration and collection needed to populate its Kubernetes workload and pod-log panels. Dashboard source lives in `observability/grafana/dashboards/workloads.json`. Helm consumes its synchronized chart-local copy in `infra/observability/dashboards/workloads.json`. The dashboard is provisioned locally and through the existing Helm observability chart.

## Files changed

| File | What changed and why |
|---|---|
| `observability/grafana/dashboards/workloads.json` | The only dashboard. It shows desired/available deployment replicas, ready/unready pods, pod phase and container reasons, restart increases with OOM evidence, Job/CronJob activity, and namespace/workload/pod/service/environment/severity-filtered stdout logs. Every panel explains its question, units, source, delay, and next step. Kubernetes panels clearly say local Compose has no Kubernetes data. |
| `observability/grafana/provisioning/dashboards/provider.yaml` | Configures local Grafana file provisioning from `/var/lib/grafana/dashboards`. |
| `docker-compose.observability.yml` | Mounts the dashboard source directory read-only into local Grafana. This lets Compose display the same dashboard, with Kubernetes-only no-data behavior. |
| `infra/observability/dashboards/workloads.json` | Chart-local copy required because Helm packages chart contents and cannot read an external repository path. Generated from the source JSON by the sync script. |
| `scripts/sync-observability-dashboards.ps1` | Copies dashboard source JSON into the chart and removes stale packaged JSON. `-Check` compares filenames and SHA-256 hashes so reviewers can detect drift. |
| `infra/observability/templates/grafana.yaml` | Adds ConfigMaps for the dashboard JSON and provider, mounts both into Grafana, and checksums dashboard files so a dashboard change rolls the Deployment. Datasource UIDs stay `prometheus`, `tempo`, and `loki`. |
| `infra/observability/templates/prometheus.yaml` | Adds a conditional kube-state-metrics scrape target with the configured environment label. |
| `infra/observability/templates/kubernetes-collection.yaml` | Adds kube-state-metrics, its namespace-scoped workload Roles and read-only metadata ClusterRole, plus a node Collector DaemonSet. The agent reads only the configured namespace's `/var/log/pods` paths, checkpoints offsets, parses container envelopes and JSON, combines multiline records, enriches Kubernetes metadata, and exports to Loki. Its pod Role is limited to the configured namespace. The existing OTLP gateway remains in place. Kubernetes Events are not collected. |
| `infra/observability/values.yaml` | Adds enablement, image, namespace, environment, ports, and resource settings for kube-state-metrics and the pod log agent. Defaults use namespace `bt`; set both namespace values for staging. |
| `docs/observability/README.md` | Documents local startup, dashboard synchronization, collection topology, component/image prerequisites, namespace configuration, duplicate-route precautions, and staging checks. |
| `docs/observability/metric-inventory.md` | Lists only workload metrics and log labels queried by this dashboard, with units and collection delay. It documents that actual emitted labels still need staging confirmation. |
| `docs/observability/runbooks.md` | Provides steps for unready/unavailable workloads, restarts/OOM, missing/duplicate pod logs, and local Compose interpretation. |
| `docs/observability/implementation-report.md` | This file: explains each remaining changed file and its purpose. |
| `apps/datapuller/src/shared/mongoose.ts` | Keeps the prior security fix that removes the MongoDB connection URI from logs; connection strings must not be logged. Unrelated datapuller dashboard and structured run-event changes were removed. |

## Collection and acceptance boundary

The node agent and state exporter are configuration only until deployed and exercised in a staging namespace. Verify the exact Collector `0.96.0` image contains the configured components, then confirm stdout metadata, readiness changes, restart metrics, Job completion, rotation, agent restarts, and log persistence after pod exit. Application events must use one ingestion route; events are not inferred from pod logs. No staging evidence or production deployment is included.
