import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'nghn-comment',
  templateUrl: 'comment.component.html',
  styleUrls: ['comment.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentComponent {
  @Input() comment: any;
}