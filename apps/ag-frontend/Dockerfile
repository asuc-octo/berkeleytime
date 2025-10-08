FROM node:alpine AS base
RUN ["npm", "install", "-g", "turbo@latest"]

FROM base AS ag-frontend-builder
WORKDIR /ag-frontend
COPY . .
RUN ["turbo", "prune", "ag-frontend", "--docker"]

FROM base AS ag-frontend-dev
WORKDIR /ag-frontend

COPY --from=ag-frontend-builder /ag-frontend/out/json/ .
COPY --from=ag-frontend-builder /ag-frontend/out/package-lock.json ./package-lock.json
RUN ["npm", "install"]

COPY --from=ag-frontend-builder /ag-frontend/out/full/ .
ENTRYPOINT ["turbo", "run", "dev", "--filter=ag-frontend"]

FROM ag-frontend-dev AS ag-frontend-prod
RUN ["turbo", "run", "build", "--filter=ag-frontend", "--env-mode=loose"]

ENTRYPOINT ["turbo", "run", "start", "--filter=ag-frontend"]