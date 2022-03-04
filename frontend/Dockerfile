FROM node:16-slim AS dev
RUN mkdir /frontend
WORKDIR /frontend
COPY package*.json .
RUN npm install --prefer-offline --no-audit
COPY . .
ENTRYPOINT npm start

FROM dev AS prod
RUN npm install -g serve
RUN npm run build
RUN rm -rf node_modules
ENTRYPOINT npm run prod
