import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewsRoutingModule } from './reviews-routing.module';
import { ReviewsListComponent } from './reviews-list/reviews-list.component';
import { ReviewsAddComponent } from './reviews-add/reviews-add.component';

@NgModule({
  declarations: [ReviewsListComponent, ReviewsAddComponent],
  imports: [CommonModule, FormsModule, ReviewsRoutingModule]
})
export class ReviewsModule {}
