FROM node:argon

MAINTAINER Franck Ernewein <franck.ernewein@tweetping.net>

COPY package.json /src/package.json
COPY entrypoint.sh /src/entrypoint.sh
COPY bin.js /src/bin.js
COPY lib/createServer.js /src/lib/createServer.js

RUN cd /src
WORKDIR /src

EXPOSE 8080

RUN npm install --production

ENTRYPOINT ["/src/entrypoint.sh"]
