# Observability runbooks

## Unavailable deployment or unready pod

1. Open the Workloads dashboard and select namespace/workload.
2. Compare desired replicas with available replicas and inspect pod phase/readiness.
3. Check waiting/termination reason and recent restarts; a restart count alone is not a crash diagnosis.
4. Search the pod stdout panel for the selected pod/container and correlate log timestamps with the readiness and restart changes.
5. If all Kubernetes panels show no data, check the kube-state-metrics target in Prometheus and its RBAC before assuming workloads are healthy.

## Restart or OOM investigation

1. Use restart increases to find when and where restarts occurred.
2. Inspect last termination and waiting reasons for `OOMKilled`, `CrashLoopBackOff`, or other reported causes.
3. Compare pod logs immediately before termination and inspect readiness/liveness probe events using `kubectl describe pod` (Kubernetes Events are not ingested by this chart).

## Missing pod logs or duplicate records

1. Confirm the `otel-pod-logs` DaemonSet is ready on the node and inspect its Collector logs.
2. Check filelog receiver access to `/var/log/pods`, `file_storage` checkpoint persistence, and Kubernetes API RBAC.
3. Confirm Loki is reachable and query the raw stream before assuming JSON parsing failed.
4. After pod exit, verify the record remains searchable; exercise rotation and agent restart in staging. Check duplicate output if the same application event is also exported over OTLP.
5. Kubernetes Events use a separate source and are not inferred from pod logs.

## Local Compose interpretation

Local Compose does not run Kubernetes collection. Kubernetes-only panels should state that explicitly. **Unknown / No data** is not a healthy/zero result. Check the local Collector and Prometheus targets only for signals actually configured in Compose.
