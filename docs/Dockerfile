# dev
FROM rust:1.83 AS docs-dev
WORKDIR /docs

RUN ["cargo", "install", "mdbook", "--vers", "^0.4", "--locked"]
RUN ["cargo", "install", "mdbook-alerts"]
RUN ["cargo", "install", "mdbook-toc"]

COPY . .
VOLUME ["/docs"]
EXPOSE 3000
ENTRYPOINT ["mdbook", "serve", "--hostname=0.0.0.0", "--port=3000"]

# prod
FROM rust:1.83 AS docs-builder
WORKDIR /docs

RUN ["cargo", "install", "mdbook", "--no-default-features", "--features", "search", "--vers", "^0.4", "--locked"]
RUN ["cargo", "install", "mdbook-alerts"]

COPY . .
RUN ["mdbook", "build"]

FROM nginx:alpine AS docs-prod
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=docs-builder /docs/book /var/www/html
EXPOSE 80
