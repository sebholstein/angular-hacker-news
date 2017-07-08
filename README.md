# Angular Hacker News PWA

A Hacker News clone / Progressive Web App (PWA) developed with Angular 4.

![screenshot](screenshot-iphone.PNG "Screenshot (iPhone/Safari)")

# Work in progress!

TODOS:
* Deployment (Caddy/Express)
* CI configuration
* HTTP/2
* The Hacker News API endpoints are missing.

Current Lighthouse stats without HTTP2:
![lighthouse](lighthouse-stats.PNG "Lighthouse stats")


## Development

1. run `yarn` or `npm install`
1. run `yarn run build` or `npm run build`
1. Install [caddy server](https://caddyserver.com/).
1. run `caddy` in the root directory
1. run also `node dist/src/server.js`
1. open [http://localhost:8082](http://localhost:8082)