# Angular Hacker News PWA

A Hacker News clone / Progressive Web App (PWA) developed with Angular 4 for the [HNPWA](https://hnpwa.com/) project.

**[SEE IT LIVE HERE!](https://angularhn.sebastian-mueller.net)**  

*[Blog post with more details](https://sebastian-mueller.net/post/angular-hacker-news-pwa/)*

## Features
* **Framework/UI libraries:** Angular 4, Angular Router, Angular HTTP
* **Module bundling:** Webpack 3 with Scope Hoisting
* **Service Worker:** sw-precache
* **Performance patterns:** HTTP/2, Server Push, Brotli
* **Server-side rendering:** Yes with @angular/platform-server
* **API:** Hacker News Firebase API & Node-hnapi (unoffical)
* **Hosting:** Digitalocean / self-hosted
* **Other details:** Lazy loading of routes
* **Author:** [Sebastian Müller](https://github.com/SebastianM)

---

## Architecture

![Architecture](architecture.png "Architecture")

The application has 3 services that run in Docker containers on a [CoreOS Container Linux](https://coreos.com/products/container-linux-subscription/) in production.

My [blog post](https://sebastian-mueller.net/post/angular-hacker-news-pwa/) has more details about the services and the architecture.

## Current Lighthouse stats
Best test result so far:   
[https://www.webpagetest.org/lighthouse.php?test=170711_54_532be7068a1836a1647889ad4ac5c1f2&run=3](https://www.webpagetest.org/lighthouse.php?test=170711_54_532be7068a1836a1647889ad4ac5c1f2&run=3)

## Development
1. Install Yarn, Java SDK, Go 1.8, [Caddy](https://caddyserver.com/), and NodeJS 8
1. run `yarn --pure-lockfile`
1. run `yarn run build` or `npm run build`
1. run `caddy` in the root directory
1. run `node dist/src/server.js`
1. run `go run api.go`
1. open [http://localhost:8082](http://localhost:8082)

TODOS:
* CI configuration