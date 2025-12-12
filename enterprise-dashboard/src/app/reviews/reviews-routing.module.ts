import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReviewsListComponent } from './reviews-list/reviews-list.component';
import { ReviewsAddComponent } from './reviews-add/reviews-add.component';

const routes: Routes = [
  { path: '', component: ReviewsListComponent },
  { path: 'add', component: ReviewsAddComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReviewsRoutingModule {}
