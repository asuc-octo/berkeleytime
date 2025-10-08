FROM node:22-alpine AS base
RUN ["npm", "install", "-g", "turbo@latest"]

FROM base AS frontend-builder
WORKDIR /frontend
COPY . .
RUN ["turbo", "prune", "frontend", "--docker"]

FROM base AS frontend-dev
WORKDIR /frontend

COPY --from=frontend-builder /frontend/out/json/ .
COPY --from=frontend-builder /frontend/out/package-lock.json ./package-lock.json
RUN ["npm", "install"]

COPY --from=frontend-builder /frontend/out/full/ .
ENTRYPOINT ["turbo", "run", "dev", "--filter=frontend"]

FROM frontend-dev AS frontend-prod
RUN ["turbo", "run", "build", "--filter=frontend", "--env-mode=loose"]

ENTRYPOINT ["turbo", "run", "start", "--filter=frontend"]