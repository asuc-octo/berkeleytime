{{/*
Chart name and version
*/}}
{{- define "bt-mongo.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Labels applied to all resources.
*/}}
{{- define "bt-mongo.labels" -}}
app.kuberentes.io/name: bt-mongo
helm.sh/chart: {{ include "bt-mongo.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/*
Resource names. "<release>-mongodb" / "<release>-mongodb-headless" match the names the Bitnami chart
used, so existing MONGODB_URI hosts (bt-<env>-mongo-mongodb-0.bt-<env>-mongo-mongodb-headless) keep working.
*/}}
{{- define "bt-mongo.mongodName" -}}
{{- printf "%s-mongodb" .Release.Name -}}
{{- end -}}

{{- define "bt-mongo.searchName" -}}
{{- printf "%s-search" .Release.Name -}}
{{- end -}}

{{- define "bt-mongo.authSecretName" -}}
{{- default (printf "%s-auth" .Release.Name) .Values.auth.secretName -}}
{{- end -}}

{{/*
Stable DNS names of the single mongod / mongot pods.
*/}}
{{- define "bt-mongo.mongodHost" -}}
{{- printf "%s-0.%s-headless.%s.svc.cluster.local" (include "bt-mongo.mongodName" .) (include "bt-mongo.mongodName" .) .Release.Namespace -}}
{{- end -}}

{{- define "bt-mongo.searchHost" -}}
{{- printf "%s-0.%s-headless.%s.svc.cluster.local" (include "bt-mongo.searchName" .) (include "bt-mongo.searchName" .) .Release.Namespace -}}
{{- end -}}

{{/*
Selector labels per component. Usage: include "bt-mongo.selectorLabels" (list . "mongod")
*/}}
{{- define "bt-mongo.selectorLabels" -}}
{{- $root := index . 0 -}}
app.kubernetes.io/instance: {{ $root.Release.Name }}
app.kubernetes.io/component: {{ index . 1 }}
{{- end -}}
