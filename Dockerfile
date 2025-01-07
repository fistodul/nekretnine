ARG NODE_VER=22
FROM node:${NODE_VER}-alpine AS base

WORKDIR /home/node/app

COPY package.json package-lock.json .env ./

RUN npm ci --omit=dev

COPY src ./src

FROM node:${NODE_VER}-alpine

WORKDIR /home/node/app

ENV NODE_ENV=production

COPY --from=base /home/node/app .

EXPOSE ${WEB_PORT}

USER node

CMD ["npm", "start"]
