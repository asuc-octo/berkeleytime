FROM oven/bun:alpine AS base
RUN bun add -g turbo

FROM base AS backend-builder
WORKDIR /backend
COPY . .
RUN ["turbo", "prune", "backend", "--docker"]

FROM base AS backend-dev
WORKDIR /backend

COPY --from=backend-builder /backend/out/json/ .
COPY --from=backend-builder /backend/out/bun.lock ./bun.lock
COPY bunfig.toml ./bunfig.toml
RUN ["bun", "install"]

COPY --from=backend-builder /backend/out/full/ .
ENTRYPOINT ["turbo", "run", "dev", "--filter=backend"]

FROM backend-dev AS backend-prod
ENTRYPOINT ["turbo", "run", "start", "--filter=backend", "--env-mode=loose"]
