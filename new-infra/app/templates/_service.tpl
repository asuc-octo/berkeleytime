# from: ingress
# to: deployment

{{- define "app.service" -}}
apiVersion: v1
kind: Service
metadata:
  name: {{ .Chart.Name }}-service
  namespace: {{ .Release.Namespace }}
spec:
  ports:
    - name: http
      port: {{ .Values.XXXXend.service.port }}
      targetPort: {{ .Values.XXXXend.service.targetPort }}
      protocol: TCP
{{- end -}}
