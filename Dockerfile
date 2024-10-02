FROM node:22-alpine

WORKDIR /home/node/app

ENV NODE_ENV=production

COPY package.json package-lock.json .env ./

RUN npm ci --omit=dev

COPY src ./src

EXPOSE ${port}

USER node

CMD ["npm", "start"]
