FROM node:latest

WORKDIR /home/app

RUN npm install

WORKDIR /home/app/lib/alis-web-index

RUN npm install

WORKDIR /home/app

ENTRYPOINT ["npm", "run", "start"]

CMD ["-s", "home/app"]
