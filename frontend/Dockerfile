FROM ubuntu:18.04
MAINTAINER ASUC OCTO octo.berkeleytime@asuc.org

RUN apt-get update
RUN apt-get install -y nodejs npm xsel

RUN mkdir frontend
WORKDIR frontend

COPY package.json package.json
RUN npm install
COPY . .

RUN npm run build

ENTRYPOINT ["npm", "start"]