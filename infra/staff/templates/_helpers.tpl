{{/*
Chart name and version
*/}}
{{- define "bt-staff.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Labels applied to all resources.
*/}}
{{- define "bt-staff.labels" -}}
helm.sh/chart: {{ include "bt-staff.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
env: {{ .Values.env }}
{{- end -}}

{{- define "bt-staff.frontendLabels" -}}
app.kubernetes.io/name: frontend
{{ include "bt-staff.labels" . }}
{{- end -}}

{{- define "bt-staff.frontendName" -}}
{{ .Release.Name }}-frontend
{{- end -}}
