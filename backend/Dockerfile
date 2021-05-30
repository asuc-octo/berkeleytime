FROM ubuntu:20.04
USER root
RUN apt update
RUN apt install -y curl
RUN curl -s https://deb.nodesource.com/setup_16.x | bash -
RUN apt update
RUN apt install -y nodejs
RUN mkdir /backend
WORKDIR /backend
COPY . /backend
RUN npm install
RUN npm run build
