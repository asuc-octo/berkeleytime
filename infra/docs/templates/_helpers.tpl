{{/*
Chart name and version
*/}}
{{- define "bt-docs.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Labels applied to all resources.
*/}}
{{- define "bt-docs.labels" -}}
helm.sh/chart: {{ include "bt-docs.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "bt-docs.docsLabels" -}}
app.kubernetes.io/name: docs
{{ include "bt-docs.labels" . }}
{{- end -}}

{{- define "bt-docs.docsName" -}}
{{ .Release.Name }}-docs
{{- end -}}
