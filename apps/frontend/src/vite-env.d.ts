/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** OTel collector OTLP endpoint path, e.g. "/otlp". Unset = tracing disabled. */
  readonly VITE_OTEL_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
