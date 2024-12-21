ARG NODE_VER=22
FROM node:${NODE_VER}-alpine as base

WORKDIR /home/node/app

ENV NODE_ENV=production

COPY package.json package-lock.json .env ./

RUN npm ci --omit=dev

COPY src ./src

FROM node:${NODE_VER}-alpine

WORKDIR /home/node/app

COPY --from=base /home/node/app .

EXPOSE ${Site_Port}

USER node

CMD ["npm", "start"]
