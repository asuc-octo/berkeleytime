FROM ubuntu:18.04 AS base
MAINTAINER ASUC OCTO octo.berkeleytime@asuc.org

RUN apt-get update && \
  apt-get install -y curl xsel && \
  curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
  apt-get install -y nodejs && \
  node --version && \
  npm --version

RUN mkdir /frontend
WORKDIR /frontend

COPY package.json package.json
RUN npm cache clean --force
RUN npm set registry https://registry.npmjs.org/
RUN npm install

COPY . /frontend

FROM base
RUN npm run build

ENTRYPOINT ["npm", "start"]
