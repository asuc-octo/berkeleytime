FROM oven/bun:alpine AS base
RUN bun add -g turbo

FROM base AS frontend-builder
WORKDIR /frontend
COPY . .
RUN ["turbo", "prune", "frontend", "--docker"]

FROM base AS frontend-dev
WORKDIR /frontend

COPY --from=frontend-builder /frontend/out/json/ .
COPY --from=frontend-builder /frontend/out/bun.lock ./bun.lock
COPY bunfig.toml ./bunfig.toml
RUN ["bun", "install"]

COPY --from=frontend-builder /frontend/out/full/ .
ENTRYPOINT ["turbo", "run", "dev", "--filter=frontend"]

FROM frontend-dev AS frontend-prod
RUN ["turbo", "run", "build", "--filter=frontend", "--env-mode=loose"]

ENTRYPOINT ["turbo", "run", "start", "--filter=frontend"]
