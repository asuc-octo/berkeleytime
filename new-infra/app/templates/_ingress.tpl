# from: ingress-controller
# to: service

{{- define "app.ingress" -}}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ .Chart.Name }}-ingress
  annotations:
    {{- if .Values.XXXXend.ingress.annotations }}
      {{ toYaml .Values.XXXXend.ingress.annotations | indent 4 }}
    {{- end }}
spec:
  tls:
    - hosts:
        {{ for $host := .Values.XXXXend.ingress.hosts }}
        - {{ $host }}
        {{- end }}
      secretName: bt-tls
  rules:
    {{ for $host, $path, $name, $port := .Values.XXXXend.ingress.rules }}
    - host: {{ $host }}
      http:
        paths:
          - path: {{ $path }}
            pathType: Prefix
            backend:
              service:
                name: {{ $name }}
                port:
                  number: {{ $port }}
    {{- end }}
{{- end -}}
