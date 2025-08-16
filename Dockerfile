FROM node:22-alpine AS base
RUN ["npm", "install", "-g", "turbo@latest"]

# datapuller
FROM base AS datapuller-builder
WORKDIR /datapuller
COPY . .

RUN ["turbo", "prune", "datapuller", "--docker"]

FROM base AS datapuller-dev
WORKDIR /datapuller

COPY --from=datapuller-builder /datapuller/out/json/ .
COPY --from=datapuller-builder /datapuller/out/package-lock.json ./package-lock.json
RUN ["npm", "install"]

COPY --from=datapuller-builder /datapuller/out/full/ .

RUN ["turbo", "run", "build", "--filter=datapuller"]
ENTRYPOINT ["turbo", "run", "main", "--filter=datapuller", "--"]
CMD ["--puller=main"]

FROM datapuller-dev AS datapuller-prod
WORKDIR /datapuller
ENTRYPOINT ["turbo", "run", "main", "--filter=datapuller", "--env-mode=loose", "--"]

# backend
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

# frontend
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
