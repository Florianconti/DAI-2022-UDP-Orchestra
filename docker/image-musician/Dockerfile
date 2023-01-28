FROM node:18.12

COPY ./src /opt/app

WORKDIR /opt/app
RUN npm install

ENTRYPOINT ["node", "/opt/app/index.js"]