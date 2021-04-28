FROM ubuntu:20.04
USER root
RUN apt update
RUN apt install -y curl
RUN curl -s https://deb.nodesource.com/setup_16.x | bash -
RUN apt update
RUN apt install -y nodejs
RUN mkdir /gitlab-notify
WORKDIR /gitlab-notify
COPY . /gitlab-notify
RUN npm install
