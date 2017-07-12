import { Component, ChangeDetectionStrategy, PLATFORM_ID, Inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

@Component({
  selector: 'nghn-item',
  templateUrl: 'item.component.html',
  styleUrls: ['item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent implements OnDestroy {
  itemToDisplay: any|null = null;
  private _subscription: Subscription;

  constructor(
    route: ActivatedRoute,
    http: Http,
    cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) _platformId
  ) {
    if (isPlatformBrowser(_platformId) === false) {
      return;
    }
    this._subscription = route.params
      .map(params => {
        return params.id;
      })
      .mergeMap(id => {
        return http.get(`/api/item/${id}`).map(r => {
          return r.json();
        });
      })
      .subscribe(item => {
        this.itemToDisplay = item;
        cd.markForCheck();
      });
  }

  ngOnDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }

  trackByFn(_: number, item: any): number {
    return item.id;
  }
}