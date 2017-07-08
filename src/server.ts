import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import { enableProdMode } from '@angular/core';
// import { AppServerModule } from './app.server';
import { AppServerModuleNgFactory } from '../dist/src/app-server.module.ngfactory';
import * as express from 'express';
import { ngUniversalEngine } from './universal-engine';
import * as compression from 'compression';
import * as expressStaticGzip from 'express-static-gzip';

enableProdMode();

const server = express();
server.use(compression());

// set our angular engine as the handler for html files, so it will be used to render them.
server.engine('html', ngUniversalEngine({
    bootstrap: [AppServerModuleNgFactory]
}));

// set default view directory
server.set('views', __dirname);
server.get(['/*.js', '/assets/*'], expressStaticGzip(__dirname, {
  enableBrotli: true
}));
// handle requests for routes in the app.  ngExpressEngine does the rendering.
server.get(['/', '/list/:mode', 'item/:id', '/index.html'], (req, res) => {
    res.render('index.html', {req});
});
server.listen(3200, function () {
    console.log('listening on port 3200...');
});