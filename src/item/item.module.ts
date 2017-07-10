import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ItemComponent } from './item/item.component';
import { CommentComponent } from './comment/comment.component';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: ':id', component: ItemComponent}
    ]),
    HttpModule
  ],
  declarations: [ItemComponent, CommentComponent]
})
export class ItemModule {}
