FROM node:alpine AS base
RUN ["npm", "install", "-g", "turbo@latest"]

FROM base AS staff-frontend-builder
WORKDIR /staff-frontend
COPY . .
RUN ["turbo", "prune", "staff-frontend", "--docker"]

FROM base AS staff-frontend-dev
WORKDIR /staff-frontend

COPY --from=staff-frontend-builder /staff-frontend/out/json/ .
COPY --from=staff-frontend-builder /staff-frontend/out/package-lock.json ./package-lock.json
RUN ["npm", "install"]

COPY --from=staff-frontend-builder /staff-frontend/out/full/ .
ENTRYPOINT ["turbo", "run", "dev", "--filter=staff-frontend"]

FROM staff-frontend-dev AS staff-frontend-prod
RUN ["turbo", "run", "build", "--filter=staff-frontend", "--env-mode=loose"]

ENTRYPOINT ["turbo", "run", "start", "--filter=staff-frontend"]
