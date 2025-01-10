FROM rust:1.83 AS docs-deps
RUN ["cargo", "install", "mdbook", "--vers", "^0.4", "--locked"]
RUN ["cargo", "install", "mdbook-alerts"]
RUN ["cargo", "install", "mdbook-toc"]

# dev
FROM docs-deps AS docs-dev
WORKDIR /docs
COPY . .
VOLUME ["/docs"]
EXPOSE 3000
ENTRYPOINT ["mdbook", "serve", "--hostname=0.0.0.0", "--port=3000"]

# prod
FROM docs-deps AS docs-builder
WORKDIR /docs
COPY . .
RUN ["mdbook", "build"]

FROM nginx:alpine AS docs-prod
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=docs-builder /docs/book /var/www/html
EXPOSE 80
