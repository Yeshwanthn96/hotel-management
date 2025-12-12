import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingsRoutingModule } from './bookings-routing.module';
import { BookingsListComponent } from './bookings-list/bookings-list.component';
import { BookingsAddComponent } from './bookings-add/bookings-add.component';
import { UserBookingsComponent } from './user-bookings/user-bookings.component';

@NgModule({
  declarations: [BookingsListComponent, BookingsAddComponent, UserBookingsComponent],
  imports: [CommonModule, FormsModule, BookingsRoutingModule]
})
export class BookingsModule {}
