# dev
FROM rust:1.83 AS docs-dev

RUN ["cargo", "install", "mdbook", "--vers", "^0.4", "--locked"]
RUN ["cargo", "install", "mdbook-alerts"]

COPY . ./docs
VOLUME ["/docs"]
EXPOSE 3000
ENTRYPOINT ["mdbook", "serve", "--hostname=0.0.0.0", "--port=3000", "docs"]

# prod
FROM rust:1.83 AS docs-builder

RUN ["cargo", "install", "mdbook", "--no-default-features", "--features search", "--vers", "^0.4", "--locked"]
RUN ["cargo", "install", "mdbook-alerts"]

COPY ./docs .
RUN ["mdbook", "build"]

FROM nginx:alpine AS docs-prod
COPY --from=docs-builder /book /usr/share/nginx/html
EXPOSE 80
