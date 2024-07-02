FROM node:20

WORKDIR /home/node/app

ENV NODE_ENV=production

COPY src ./src

COPY package.json package-lock.json .env ./

RUN npm install

EXPOSE ${port}

USER node

CMD ["npm", "start"]
