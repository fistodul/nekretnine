FROM node:20

WORKDIR /home/node/app

ENV NODE_ENV=production

COPY package.json package-lock.json .env ./

COPY src ./src

RUN npm install

EXPOSE ${port}

USER node

CMD ["npm", "start"]