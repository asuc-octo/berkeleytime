FROM node:16-slim AS builder
MAINTAINER ASUC OCTO octo.berkeleytime@asuc.org
RUN mkdir /backend
WORKDIR /backend
COPY . .
RUN npm install --only prod
RUN npm run build
