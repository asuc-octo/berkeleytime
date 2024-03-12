FROM node:16.14.2-slim AS builder
RUN mkdir /backend
WORKDIR /backend
RUN  apt-get update \
  && apt-get install -y wget \
  && rm -rf /var/lib/apt/lists/*
RUN apt-get update && wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu1804-arm64-100.9.0.deb && \
    apt-get -y install ./mongodb-database-tools-*100.9.0.deb && \
    rm -f mongodb-database-tools-*.deb && \ 
    apt install -y curl
COPY package.json .
RUN npm install --prefer-offline --no-audit
COPY . .
RUN npm run build
ENTRYPOINT node build
