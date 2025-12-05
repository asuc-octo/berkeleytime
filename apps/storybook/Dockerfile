FROM oven/bun:alpine AS base
RUN bun add -g turbo

FROM base AS storybook-builder
WORKDIR /storybook
COPY . .
RUN ["turbo", "prune", "@repo/storybook", "--docker"]

FROM base AS storybook-dev
WORKDIR /storybook

COPY --from=storybook-builder /storybook/out/json/ .
COPY --from=storybook-builder /storybook/out/bun.lock ./bun.lock
COPY bunfig.toml ./bunfig.toml
RUN ["bun", "install"]

COPY --from=storybook-builder /storybook/out/full/ .
ENTRYPOINT ["turbo", "run", "dev", "--filter=@repo/storybook"]

FROM storybook-dev AS storybook-prod-builder
WORKDIR /storybook

RUN ["turbo", "run", "build", "--filter=@repo/storybook"]

FROM nginx:alpine AS storybook-prod
COPY --from=storybook-prod-builder /storybook/apps/storybook/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=storybook-prod-builder /storybook/apps/storybook/dist /var/www/html
EXPOSE 80
