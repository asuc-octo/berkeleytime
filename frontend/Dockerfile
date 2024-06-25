FROM node:slim AS dev
RUN mkdir /frontend
WORKDIR /frontend
COPY package.json .
RUN npm install
COPY . .
ENTRYPOINT npm run dev

FROM dev AS prod
RUN npm install -g serve
RUN npm run build
RUN rm -rf node_modules
ENTRYPOINT npm run start
