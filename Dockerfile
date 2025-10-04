ARG NODE_VER=22
FROM node:${NODE_VER}-alpine AS base

WORKDIR /home/node/app

COPY package.json package-lock.json .env ./

RUN npm ci --omit=dev --ignore-scripts

COPY src ./src

RUN rm -f package.json package-lock.json src/app.sh


FROM gcr.io/distroless/nodejs${NODE_VER}:latest-amd64

WORKDIR /app

COPY --from=base /home/node/app .

WORKDIR /app/src

EXPOSE ${WEB_PORT}

CMD ["app.js"]
