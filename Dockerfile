FROM node:alpine AS base

# backend
FROM base AS backend-builder
WORKDIR /backend
COPY . .
RUN npx turbo prune backend --docker

FROM base AS backend-dev
WORKDIR /backend

COPY --from=backend-builder /backend/out/json/ .
COPY --from=backend-builder /backend/out/package-lock.json ./package-lock.json
RUN npm install

COPY --from=backend-builder /backend/out/full/ .
ENTRYPOINT npx turbo run dev --filter=backend

FROM backend-dev AS backend-prod
ENTRYPOINT npx turbo run start --filter=backend

# frontend
FROM base AS frontend-builder
WORKDIR /frontend
COPY . .
RUN npx turbo prune frontend --docker

FROM base AS frontend-dev
WORKDIR /frontend

COPY --from=frontend-builder /frontend/out/json/ .
COPY --from=frontend-builder /frontend/out/package-lock.json ./package-lock.json
RUN npm install

COPY --from=frontend-builder /frontend/out/full/ .
ENTRYPOINT npx turbo run dev --filter=frontend

FROM frontend-dev AS frontend-prod
ENTRYPOINT npx turbo run start --filter=frontend
