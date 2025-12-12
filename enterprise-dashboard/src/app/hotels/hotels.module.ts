import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelsRoutingModule } from './hotels-routing.module';
import { HotelsListComponent } from './hotels-list/hotels-list.component';
import { HotelsAddComponent } from './hotels-add/hotels-add.component';
import { HotelDetailsComponent } from './hotel-details/hotel-details.component';
import { RoomManagementComponent } from './room-management/room-management.component';

@NgModule({
  declarations: [
    HotelsListComponent,
    HotelsAddComponent,
    HotelDetailsComponent,
    RoomManagementComponent
  ],
  imports: [CommonModule, FormsModule, HotelsRoutingModule]
})
export class HotelsModule {}
