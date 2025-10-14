{{/*
Chart name and version
*/}}
{{- define "bt-ag.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Labels applied to all resources.
*/}}
{{- define "bt-ag.labels" -}}
helm.sh/chart: {{ include "bt-ag.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
env: {{ .Values.env }}
{{- end -}}

{{- define "bt-ag.frontendLabels" -}}
app.kubernetes.io/name: frontend
{{ include "bt-ag.labels" . }}
{{- end -}}

{{- define "bt-ag.frontendName" -}}
{{ .Release.Name }}-frontend
{{- end -}}
