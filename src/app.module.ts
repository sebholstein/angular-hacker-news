import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { ListComponent } from './components/list/list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list/top',
    pathMatch: 'full'
  },
  {
    path: 'list/:mode',
    component: ListComponent
  }
];

@NgModule({
  imports: [
    BrowserModule.withServerTransition({appId: 'NGHN'}),
    RouterModule.forRoot(routes, {useHash: true}),
    HttpModule
  ],
  declarations: [AppComponent, ListComponent],
  exports: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {

}