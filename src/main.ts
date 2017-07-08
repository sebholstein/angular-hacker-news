import 'zone.js/dist/zone';
import 'reflect-metadata';
import { platformBrowser }    from '@angular/platform-browser';
import { AppModuleNgFactory } from '../dist/src/app.module.ngfactory';
import { enableProdMode } from '@angular/core';

enableProdMode();
platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
