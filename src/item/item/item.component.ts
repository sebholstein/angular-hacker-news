import { Component, ChangeDetectionStrategy, PLATFORM_ID, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { isPlatformBrowser } from '@angular/common';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';

@Component({
  selector: 'nghn-item',
  templateUrl: 'item.component.html',
  styleUrls: ['item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent {
  itemToDisplay: Observable<any>|null = null;

  constructor(route: ActivatedRoute, http: Http, @Inject(PLATFORM_ID) _platformId) {
    if (isPlatformBrowser(_platformId) === false) {
      return;
    }
    this.itemToDisplay = route.params
      .map(params => {
        return params.id;
      })
      .mergeMap(id => {
        return http.get(`/api/item/${id}`).map(r => {
          return r.json();
        });
      })
      .first();
  }

  trackByFn(_: number, item: any): number {
    return item.id;
  }
}