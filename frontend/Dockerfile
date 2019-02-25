FROM ubuntu:18.04
MAINTAINER ASUC OCTO octo.berkeleytime@asuc.org

RUN apt-get update
RUN apt-get install -y nodejs npm

RUN mkdir frontend
WORKDIR frontend

COPY . .

RUN npm install .

ENTRYPOINT ["npm", "start"]