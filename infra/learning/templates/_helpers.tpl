{{/*
Chart name and version
*/}}
{{- define "bt-learning.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Labels applied to all resources.
*/}}
{{- define "bt-learning.labels" -}}
helm.sh/chart: {{ include "bt-learning.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "bt-learning.learningLabels" -}}
app.kubernetes.io/name: learning
{{ include "bt-learning.labels" . }}
{{- end -}}

{{- define "bt-learning.learningName" -}}
{{ .Release.Name }}-learning
{{- end -}}
