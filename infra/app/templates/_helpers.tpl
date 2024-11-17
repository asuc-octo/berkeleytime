{{/*
Chart name and version
*/}}
{{- define "bt-app.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Labels applied to all resources.
*/}}
{{- define "bt-app.labels" -}}
helm.sh/chart: {{ include "bt-app.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
env: {{ .Values.env }}
{{- end -}}

{{- define "bt-app.backendLabels" -}}
app.kubernetes.io/name: backend
{{ include "bt-app.labels" . }}
{{- end -}}

{{- define "bt-app.frontendLabels" -}}
app.kubernetes.io/name: frontend
{{ include "bt-app.labels" . }}
{{- end -}}

{{- define "bt-app.updaterLabels" -}}
app.kubernetes.io/name: updater
{{ include "bt-app.labels" . }}
{{- end -}}

{{- define "bt-app.datapullerLabels" -}}
app.kubernetes.io/name: datapuller
{{ include "bt-app.labels" . }}
{{- end -}}

{{- define "bt-app.backendName" -}}
{{ .Release.Name }}-backend
{{- end -}}

{{- define "bt-app.frontendName" -}}
{{ .Release.Name }}-frontend
{{- end -}}

{{- define "bt-app.updaterName" -}}
{{ .Release.Name }}-updater
{{- end -}}

{{- define "bt-app.cleanupName" -}}
{{ .Release.Name }}-cleanup
{{- end -}}

{{- define "bt-app.datapullerName" -}}
{{ .Release.Name }}-datapuller
{{- end -}}