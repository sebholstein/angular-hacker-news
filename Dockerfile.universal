FROM node:8

# install yarn
RUN curl -o- -L https://yarnpkg.com/install.sh | bash

COPY dist /universal/dist
COPY package.json /universal/
COPY yarn.lock /universal/

WORKDIR /universal

RUN yarn --pure-lockfile --production=true

EXPOSE 3200

ENTRYPOINT ["/usr/local/bin/node", "./dist/src/server.js"]
