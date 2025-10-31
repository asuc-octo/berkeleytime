{{/*
Chart name and version
*/}}
{{- define "bt-storybook.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Labels applied to all resources.
*/}}
{{- define "bt-storybook.labels" -}}
helm.sh/chart: {{ include "bt-storybook.chart" . }}
app.kubernetes.io/manstorybooked-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
env: {{ .Values.env }}
{{- end -}}

{{- define "bt-storybook.frontendLabels" -}}
app.kubernetes.io/name: frontend
{{ include "bt-storybook.labels" . }}
{{- end -}}

{{- define "bt-storybook.frontendName" -}}
{{ .Release.Name }}-frontend
{{- end -}}