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

{{- define "bt-app.datapullerLabels" -}}
app.kubernetes.io/name: datapuller
{{ include "bt-app.labels" . }}
{{- end -}}

{{- define "bt-app.cleanupLabels" -}}
app.kubernetes.io/name: cleanup
{{ include "bt-app.labels" . }}
{{- end -}}

{{- define "bt-app.backendName" -}}
{{ .Release.Name }}-backend
{{- end -}}

{{- define "bt-app.frontendName" -}}
{{ .Release.Name }}-frontend
{{- end -}}

{{- define "bt-app.cleanupName" -}}
{{ .Release.Name }}-cleanup
{{- end -}}

{{- define "bt-app.datapullerName" -}}
{{ .Release.Name }}-datapuller
{{- end -}}

{{- define "bt-app.semanticSearchLabels" -}}
app.kubernetes.io/name: semantic-search
{{ include "bt-app.labels" . }}
{{- end -}}

{{- define "bt-app.semanticSearchName" -}}
{{ .Release.Name }}-semantic-search
{{- end -}}

{{/*
MongoDB credentials. When mongoAuthSecret is set, MONGODB_URI is rebuilt from mongoUri with the app user's
password from that Secret (bt-mongo chart's "<release>-auth"); env entries override the ConfigMap's MONGODB_URI.
Must be included under a container's `env:`.
*/}}
{{- define "bt-app.mongoEnv" -}}
{{- if .Values.mongoAuthSecret }}
{{- $sep := ternary "&" "?" (contains "?" .Values.mongoUri) }}
- name: MONGODB_PASSWORD
  valueFrom:
    secretKeyRef:
      name: {{ .Values.mongoAuthSecret }}
      key: app-password
- name: MONGODB_URI
  value: {{ printf "mongodb://%s:$(MONGODB_PASSWORD)@%s%sauthSource=admin" .Values.mongoUser (trimPrefix "mongodb://" .Values.mongoUri) $sep | quote }}
{{- end }}
{{- end -}}
