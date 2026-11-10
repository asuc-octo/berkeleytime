{{- define "bt-observability.collectorConfig" -}}
extensions:
  health_check:
    endpoint: "0.0.0.0:13133"

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: "0.0.0.0:4317"
      http:
        endpoint: "0.0.0.0:4318"

{{ if .Values.mongodb.enabled }}
  mongodb:
    hosts:
      - endpoint: {{ required "mongodb.endpoint is required" .Values.mongodb.endpoint | quote }}
    {{- if .Values.mongodb.replicaSet }}
    replica_set: {{ .Values.mongodb.replicaSet | quote }}
    {{- end }}
    tls:
      insecure: true
    collection_interval: 15s
{{ end }}
{{ if .Values.dependencies.nginx.enabled }}
  nginx:
    endpoint: {{ required "dependencies.nginx.endpoint is required" .Values.dependencies.nginx.endpoint | quote }}
    collection_interval: 15s
{{ end }}

connectors:
  # Derives metrics from spans
  spanmetrics:
    namespace: span
    metrics_flush_interval: 15s
    dimensions:
      - name: page.feature
      - name: page.route
    histogram:
      explicit:
        buckets: [5, 10, 25, 50, 100, 250, 500, 1000]

processors:
  resource/mongodb:
    attributes:
      - {action: upsert, key: service.name, value: mongodb}
      - {action: upsert, key: k8s.namespace.name, value: {{ .Values.mongodb.namespace | default .Release.Namespace | quote }}}
  resource/nginx:
    attributes:
      - {action: upsert, key: service.name, value: nginx}
      - {action: upsert, key: k8s.namespace.name, value: {{ .Values.dependencies.nginx.namespace | default .Release.Namespace | quote }}}
  batch:
    timeout: 5s
    send_batch_size: 1024

  memory_limiter:
    check_interval: 5s
    limit_mib: 400
    spike_limit_mib: 100

  resource:
    attributes:
      - action: insert
        key: deployment.environment
        value: {{ .Values.environment | quote }}

exporters:
  otlp/tempo:
    endpoint: tempo:4317
    tls:
      insecure: true

  loki:
    endpoint: http://loki:3100/loki/api/v1/push
    default_labels_enabled:
      exporter: false
      job: true
      instance: false
      level: true

  prometheus:
    endpoint: "0.0.0.0:9464"
    send_timestamps: true
    resource_to_telemetry_conversion:
      enabled: true

service:
  telemetry:
    metrics:
      address: "0.0.0.0:8888"
  extensions: [health_check]
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, resource, batch]
      exporters: [spanmetrics, otlp/tempo]
    logs:
      receivers: [otlp]
      processors: [memory_limiter, resource, batch]
      exporters: [loki]
    metrics:
      receivers: [otlp, spanmetrics]
      processors: [memory_limiter, resource, batch]
      exporters: [prometheus]
{{ if .Values.mongodb.enabled }}
    metrics/mongodb:
      receivers: [mongodb]
      processors: [memory_limiter, resource, resource/mongodb, batch]
      exporters: [prometheus]
{{ end }}
{{ if .Values.dependencies.nginx.enabled }}
    metrics/nginx:
      receivers: [nginx]
      processors: [memory_limiter, resource, resource/nginx, batch]
      exporters: [prometheus]
{{ end }}
{{- end -}}
