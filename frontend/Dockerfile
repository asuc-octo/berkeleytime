FROM node:14.19.3-slim AS dev
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
