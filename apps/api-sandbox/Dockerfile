FROM node:22-alpine AS base
RUN ["npm", "install", "-g", "turbo@latest"]

FROM base AS api-sandbox-builder
WORKDIR /api-sandbox
COPY . .
RUN ["turbo", "prune", "api-sandbox", "--docker"]

FROM base AS api-sandbox-dev
WORKDIR /api-sandbox
RUN ["npm", "install", "-g", "turbo@latest"]

COPY --from=api-sandbox-builder /api-sandbox/out/json/ .
COPY --from=api-sandbox-builder /api-sandbox/out/package-lock.json ./package-lock.json
RUN ["npm", "install"]

COPY --from=api-sandbox-builder /api-sandbox/out/full/ .
ENTRYPOINT ["turbo", "run", "dev", "--filter=api-sandbox"]

FROM api-sandbox-dev AS api-sandbox-prod
RUN ["turbo", "run", "build", "--filter=api-sandbox", "--env-mode=loose"]

ENTRYPOINT ["turbo", "run", "start", "--filter=api-sandbox"]
