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