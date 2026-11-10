# Kubernetes workload metric and label inventory

The workloads dashboard uses kube-state-metrics and the node Collector log path. Confirm actual names and labels from Prometheus and Loki after installing into the staging namespace.

| Signal | Source / metric family | Labels | Units / expected delay |
|---|---|---|---|
| Desired/available deployment replicas | `kube_deployment_spec_replicas`, `kube_deployment_status_replicas_available` | `namespace`, `deployment`, `environment` | replicas / 15–45 seconds |
| Pod phase and readiness | `kube_pod_status_phase`, `kube_pod_status_ready` | `namespace`, `pod`, `phase` or `condition`, `environment` | state / 15–45 seconds |
| Pod service identity | `kube_pod_labels` with only `app.kubernetes.io/name` allowlisted | `namespace`, `pod`, `label_app_kubernetes_io_name`, `environment` | identity / 15–45 seconds |
| Restarts and reasons | `kube_pod_container_status_restarts_total`, `kube_pod_container_status_waiting_reason`, `kube_pod_container_status_terminated_reason`, `kube_pod_container_status_last_terminated_reason` | `namespace`, `pod`, `container`, `reason`, `environment` | count/state / 15–45 seconds |
| Job/CronJob activity | `kube_job_status_active`, `kube_job_status_succeeded`, `kube_job_status_failed`, `kube_cronjob_spec_suspend`, `kube_cronjob_next_schedule_time` | `namespace`, `job_name` or `cronjob`, `environment` | count/state/time / 15–45 seconds |
| Pod stdout/stderr | Collector `filelog` → Loki | `k8s_namespace_name`, `k8s_pod_name`, `k8s_container_name`, `k8s_deployment_name`, `service_name`, `deployment_environment` | log events / usually under 30 seconds |

Loki labels are set through the Collector exporter label hint. Verify their actual spelling and values in staging. Keep run IDs, trace IDs, user IDs, raw URLs, and error messages out of metric labels and Loki index labels. Preserve useful diagnostic details as log fields. Never collect credentials, database connection strings, tokens, GraphQL variables, or raw personal data.

Stable datasource UIDs are `prometheus`, `tempo`, and `loki`. Local Compose has no Kubernetes state or pod logs; these dashboard panels must show **Kubernetes only — unavailable in local Compose** and treat absent telemetry as **Unknown / No data**.
