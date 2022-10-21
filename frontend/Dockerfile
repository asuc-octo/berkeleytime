FROM node:14-slim@sha256:4402144207a33ba95cb1119be593b9a9699721ad46e15acd32a0b5ca8784a527 AS dev
RUN mkdir /frontend
WORKDIR /frontend
COPY package.json .
RUN npm install
COPY . .
ENTRYPOINT npm start

FROM dev AS prod
RUN npm install -g serve
RUN npm run build
RUN rm -rf node_modules
ENTRYPOINT npm run prod
