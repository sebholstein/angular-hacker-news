
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Component({
  selector: 'nghn-list',
  styleUrls: ['list.component.css'],
  templateUrl: 'list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  content: Observable<any[]>;
  urls: {[key: string]: string} = {
    top: 'http://api.hackerwebapp.com/news',
    new: ''
  }
  page = 1;
  mode: string = '';

  constructor(route: ActivatedRoute, title: Title, http: Http) {
    route.params.subscribe(data => {
      route.queryParamMap.subscribe((queryParams) => {
        const page = queryParams.get('p');
        this.mode = data.mode;
        const pageQuery = (page != null && parseInt(page) > 0) ? `?p=${queryParams.get('p')}` : '';
        this.page = page != null && parseInt(page) > 0 ? parseInt(page, 10) : 1;
        this.content = http.get(this.urls[data.mode] + pageQuery).map((r) => r.json());
        const pageTitle = (<string>data.mode[0]).toUpperCase() + (<string>data.mode).substr(1, data.mode.length-1);
        title.setTitle(pageTitle + ' | Angular HN');
      })
      
    })
  }

  trackByFn(_: number, item: any) {
    console.log(item.id);
    return item.id;
  }

  get nextPage(): number {
    return this.page + 1;
  }
  
  get prevPage(): number {
    return this.page > 1 ? this.page - 1 : 1;
  }
}
