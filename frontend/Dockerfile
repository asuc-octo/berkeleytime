FROM node:12-slim AS builder
MAINTAINER ASUC OCTO octo.berkeleytime@asuc.org
RUN mkdir /frontend
WORKDIR /frontend
COPY . .
RUN npm install --only prod
RUN npm run build
RUN rm -rf node_modules

FROM node:12-slim
RUN mkdir /frontend
WORKDIR /frontend
RUN npm install -g serve
COPY --from=builder /frontend .
