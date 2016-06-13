FROM node:argon

WORKDIR /service

COPY package.json ./package.json
RUN npm install

COPY lib/ ./lib/
COPY test/ ./test/
COPY index.js ./index.js

CMD npm test
