FROM node:latest

WORKDIR /home/app

COPY package.json /home/app

RUN npm install -q

WORKDIR /home/app/lib/alis-web-index

COPY lib/alis-web-index/package.json /home/app/lib/alis-web-index

RUN npm install -q

WORKDIR /home/app

ENTRYPOINT ["npm", "run", "start"]

CMD ["-s", "home/app"]
