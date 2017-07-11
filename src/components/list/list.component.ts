
import { Component, ChangeDetectionStrategy, PLATFORM_ID, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'nghn-list',
  styleUrls: ['list.component.css'],
  templateUrl: 'list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  isBrowser: boolean = isPlatformBrowser(this._platformId);
  content: Observable<any[]>;
  page = 1;
  pages = 0;
  mode: string = '';

  constructor(
    private _route: ActivatedRoute,
    private _title: Title,
    private _http: Http,
    @Inject(PLATFORM_ID) private _platformId
  ) {
    if (!this.isBrowser) {
      return;
    }
    this._fetchData();
  }

  private _fetchData() {
    this.content = Observable
      .combineLatest(this._route.params, this._route.queryParamMap)
      .switchMap(([params, queryParams]) => {
        const page = queryParams.get('page');
        this.mode = params.mode;
        const pageQuery = (page != null && parseInt(page) > 0) ? `?p=${page}` : '';
        this.page = page != null && parseInt(page) > 0 ? parseInt(page, 10) : 1;
        return this._http.get('/api/' + this.mode + pageQuery)
          .do(r => {
            if (r.headers != null) {
              const pagesHeader = r.headers.get('X-Pages');
              this.pages = pagesHeader != null ? parseInt(pagesHeader, 10) : 0;
              const pageTitle = (<string>params.mode[0]).toUpperCase() + (<string>params.mode).substr(1, params.mode.length-1);
              this._title.setTitle(pageTitle + ' | Angular HN');
            }
          })
          .map(r => r.json())
      });
  }

  trackByFn(_: number, item: any): number {
    return item.id;
  }

  get nextPage(): number {
    return this.page < this.pages ? this.page + 1 : this.page;
  }
  
  get prevPage(): number {
    return this.page > 1 ? this.page - 1 : 1;
  }
}
