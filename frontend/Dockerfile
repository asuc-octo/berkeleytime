FROM ubuntu:18.04
MAINTAINER ASUC OCTO octo.berkeleytime@asuc.org

RUN apt-get update && \
  apt-get install -y curl xsel && \
  curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
  apt-get install -y nodejs && \
  node --version && \
  npm --version

RUN mkdir frontend
WORKDIR frontend

RUN pwd

COPY package.json package.json
RUN npm install
COPY . .

RUN npm run build

ENTRYPOINT ["npm", "start"]
