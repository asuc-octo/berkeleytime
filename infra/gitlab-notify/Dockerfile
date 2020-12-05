FROM ubuntu:20.04
USER root
RUN apt update
RUN apt install -y curl
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt update
RUN apt install -y nodejs
RUN mkdir /gitlab-notify
WORKDIR /gitlab-notify
COPY . /gitlab-notify
RUN npm install
