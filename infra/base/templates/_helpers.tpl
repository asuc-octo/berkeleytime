{{/*
Chart name and version
*/}}
{{- define "bt-base.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "bt-base.labels" -}}
app.kubernetes.io/name: base
helm.sh/chart: {{ include "bt-base.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
