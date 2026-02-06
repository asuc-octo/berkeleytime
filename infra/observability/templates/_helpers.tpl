{{/*
Expand the name of the chart.
*/}}
{{- define "bt-observability.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "bt-observability.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "bt-observability.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: bt-observability
{{- end }}

{{/*
Collector labels
*/}}
{{- define "bt-observability.collectorLabels" -}}
{{ include "bt-observability.labels" . }}
app.kubernetes.io/name: otel-collector
app.kubernetes.io/component: collector
{{- end }}

{{/*
Tempo labels
*/}}
{{- define "bt-observability.tempoLabels" -}}
{{ include "bt-observability.labels" . }}
app.kubernetes.io/name: tempo
app.kubernetes.io/component: tracing
{{- end }}

{{/*
Loki labels
*/}}
{{- define "bt-observability.lokiLabels" -}}
{{ include "bt-observability.labels" . }}
app.kubernetes.io/name: loki
app.kubernetes.io/component: logging
{{- end }}

{{/*
Prometheus labels
*/}}
{{- define "bt-observability.prometheusLabels" -}}
{{ include "bt-observability.labels" . }}
app.kubernetes.io/name: prometheus
app.kubernetes.io/component: metrics
{{- end }}

{{/*
Grafana labels
*/}}
{{- define "bt-observability.grafanaLabels" -}}
{{ include "bt-observability.labels" . }}
app.kubernetes.io/name: grafana
app.kubernetes.io/component: visualization
{{- end }}
