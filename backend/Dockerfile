FROM node:20.20.0-trixie-slim

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
RUN npm install && npm run compile

EXPOSE 3000

CMD [ "npm", "start" ]
