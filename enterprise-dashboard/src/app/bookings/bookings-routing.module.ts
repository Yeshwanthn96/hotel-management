import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingsListComponent } from './bookings-list/bookings-list.component';
import { BookingsAddComponent } from './bookings-add/bookings-add.component';
import { UserBookingsComponent } from './user-bookings/user-bookings.component';

const routes: Routes = [
  { path: '', component: UserBookingsComponent }, // User's own bookings
  { path: 'my-bookings', component: UserBookingsComponent },
  { path: 'add', component: BookingsAddComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingsRoutingModule {}
