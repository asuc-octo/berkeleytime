{{/* Namespaced workload metrics; node metrics remain explicitly cluster-wide. */}}
{{- define "bt-observability.resourceMetricFilter" -}}
- source_labels: [namespace]
  regex: {{ printf "^(%s)?$" (join "|" .Values.resourceMetrics.namespaces) | quote }}
  action: keep
{{- end -}}

{{/* An enabled static source must have actual target addresses. */}}
{{- define "bt-observability.requireStaticTargets" -}}
{{- $groups := .targets -}}
{{- if empty $groups -}}
{{- fail (printf "%s must contain at least one target group when enabled" .name) -}}
{{- end -}}
{{- range $index, $group := $groups -}}
{{- $addresses := $group.targets -}}
{{- if empty $addresses -}}
{{- fail (printf "%s[%d].targets must contain at least one endpoint" $.name $index) -}}
{{- end -}}
{{- range $addresses -}}
{{- $_ := required (printf "%s[%d].targets cannot contain an empty endpoint" $.name $index) . -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "bt-observability.prometheusConfig" -}}
global:
  scrape_interval: 15s
  evaluation_interval: 15s
{{ if .Values.resourceMetrics.enabled }}
rule_files:
  - /etc/prometheus/rules/resources.yml
{{ end }}
scrape_configs:
  - job_name: otel-collector
    sample_limit: {{ .Values.prometheus.sampleLimit }}
    static_configs:
      - targets: [otel-collector:9464]
        labels:
          deployment_environment: {{ .Values.environment | quote }}
    metric_relabel_configs:
      - source_labels: [exported_deployment_environment]
        regex: (.+)
        target_label: deployment_environment
      - action: labeldrop
        regex: exported_deployment_environment
      - source_labels: [deployment_environment]
        regex: "^$"
        target_label: deployment_environment
        replacement: {{ .Values.environment | quote }}
      - source_labels: [k8s_namespace_name]
        regex: (.+)
        target_label: namespace
      - source_labels: [k8s_pod_name]
        regex: (.+)
        target_label: pod
  - job_name: prometheus
    sample_limit: {{ .Values.prometheus.sampleLimit }}
    static_configs:
      - targets: [localhost:9090]
        labels:
          deployment_environment: {{ .Values.environment | quote }}
  # Collector self-metrics are independent of the application metrics exporter.
  - job_name: otel-collector-internal
    sample_limit: {{ .Values.prometheus.sampleLimit }}
    static_configs:
      - targets: [otel-collector:8888]
        labels:
          deployment_environment: {{ .Values.environment | quote }}
{{ if .Values.resourceMetrics.enabled }}
{{ range .Values.resourceMetrics.namespaces }}
{{ if not (regexMatch "^[a-z0-9]([-a-z0-9]*[a-z0-9])?$" .) }}
{{ fail "resourceMetrics.namespaces entries must be literal namespace names" }}
{{ end }}
{{ end }}
{{ if empty .Values.resourceMetrics.namespaces }}
{{ fail "resourceMetrics.namespaces must explicitly list monitored namespaces" }}
{{ end }}
{{ if .Values.resourceMetrics.kubelet.enabled }}
{{ if not (or .Values.resourceMetrics.kubelet.metricsTargets .Values.resourceMetrics.kubelet.cadvisorTargets) }}
{{ fail "resourceMetrics.kubelet requires metricsTargets or cadvisorTargets when enabled" }}
{{ end }}
{{ range $source := list (dict "job" "kubelet" "name" "resourceMetrics.kubelet.metricsTargets" "path" .Values.resourceMetrics.kubelet.metricsPath "targets" .Values.resourceMetrics.kubelet.metricsTargets) (dict "job" "cadvisor" "name" "resourceMetrics.kubelet.cadvisorTargets" "path" .Values.resourceMetrics.kubelet.cadvisorPath "targets" .Values.resourceMetrics.kubelet.cadvisorTargets) }}
{{ if $source.targets }}
{{ include "bt-observability.requireStaticTargets" $source }}
  - job_name: {{ $source.job }}
    sample_limit: {{ $.Values.prometheus.sampleLimit }}
    scrape_interval: {{ $.Values.resourceMetrics.scrapeInterval }}
    scrape_timeout: {{ $.Values.resourceMetrics.scrapeTimeout }}
    metrics_path: {{ $source.path }}
    static_configs:
      {{- toYaml $source.targets | nindent 6 }}
    relabel_configs:
      - target_label: deployment_environment
        replacement: {{ $.Values.environment | quote }}
    metric_relabel_configs:
      {{- include "bt-observability.resourceMetricFilter" $ | nindent 6 }}
{{ end }}
{{ end }}
{{ end }}
{{ if .Values.resourceMetrics.kubeStateMetrics.enabled }}
  - job_name: kube-state-metrics
    sample_limit: {{ .Values.prometheus.sampleLimit }}
    scrape_interval: {{ .Values.resourceMetrics.scrapeInterval }}
    scrape_timeout: {{ .Values.resourceMetrics.scrapeTimeout }}
    static_configs:
      - targets: [{{ required "resourceMetrics.kubeStateMetrics.target is required" .Values.resourceMetrics.kubeStateMetrics.target | quote }}]
        labels:
          deployment_environment: {{ .Values.environment | quote }}
    metric_relabel_configs:
      {{- include "bt-observability.resourceMetricFilter" . | nindent 6 }}
{{ end }}
{{ if .Values.resourceMetrics.nodeExporter.enabled }}
{{ include "bt-observability.requireStaticTargets" (dict "name" "resourceMetrics.nodeExporter.targets" "targets" .Values.resourceMetrics.nodeExporter.targets) }}
  - job_name: node-exporter
    sample_limit: {{ .Values.prometheus.sampleLimit }}
    scrape_interval: {{ .Values.resourceMetrics.scrapeInterval }}
    scrape_timeout: {{ .Values.resourceMetrics.scrapeTimeout }}
    static_configs:
      {{- toYaml .Values.resourceMetrics.nodeExporter.targets | nindent 6 }}
    relabel_configs:
      - target_label: deployment_environment
        replacement: {{ .Values.environment | quote }}
{{ end }}
{{ end }}
{{- end -}}
