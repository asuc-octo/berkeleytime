FROM node:22-alpine AS base
RUN ["npm", "install", "-g", "turbo@latest"]

FROM base AS backend-builder
WORKDIR /backend
COPY . .
RUN ["turbo", "prune", "backend", "--docker"]

FROM base AS backend-dev
WORKDIR /backend

COPY --from=backend-builder /backend/out/json/ .
COPY --from=backend-builder /backend/out/package-lock.json ./package-lock.json
RUN ["npm", "install"]

COPY --from=backend-builder /backend/out/full/ .
ENTRYPOINT ["turbo", "run", "dev", "--filter=backend"]

FROM backend-dev AS backend-prod
ENTRYPOINT ["turbo", "run", "start", "--filter=backend", "--env-mode=loose"]
