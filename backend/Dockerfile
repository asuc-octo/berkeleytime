FROM node:16.14.2-slim AS builder
RUN mkdir /backend
WORKDIR /backend
COPY package.json .
RUN npm install --prefer-offline --no-audit
COPY . .
RUN npm run build
ENTRYPOINT node build
