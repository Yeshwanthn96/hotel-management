import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingsListComponent } from './bookings-list/bookings-list.component';
import { BookingsAddComponent } from './bookings-add/bookings-add.component';
import { UserBookingsComponent } from './user-bookings/user-bookings.component';
import { BookingDetailsComponent } from './booking-details/booking-details.component';
import { BookingReviewComponent } from './booking-review/booking-review.component';

const routes: Routes = [
  { path: '', component: BookingsListComponent }, // Shows all bookings for admin, own bookings for users
  { path: 'my-bookings', component: UserBookingsComponent },
  { path: 'all', component: BookingsListComponent }, // Admin: all bookings management
  { path: 'add', component: BookingsAddComponent },
  { path: 'details/:id', component: BookingDetailsComponent },
  { path: 'review/:id', component: BookingReviewComponent } // Write review for completed booking
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingsRoutingModule {}
