FROM node:16-slim AS builder
MAINTAINER ASUC OCTO octo.berkeleytime@asuc.org
RUN mkdir /backend
WORKDIR /backend
COPY package.json .
RUN npm install --prefer-offline --no-audit
COPY . .
RUN npm run build
ENTRYPOINT node build
