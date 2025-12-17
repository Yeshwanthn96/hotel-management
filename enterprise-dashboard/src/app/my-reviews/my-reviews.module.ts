import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MyReviewsRoutingModule } from './my-reviews-routing.module';
import { MyReviewsComponent } from './my-reviews.component';

@NgModule({
  declarations: [MyReviewsComponent],
  imports: [
    CommonModule,
    FormsModule,
    MyReviewsRoutingModule
  ]
})
export class MyReviewsModule {}
