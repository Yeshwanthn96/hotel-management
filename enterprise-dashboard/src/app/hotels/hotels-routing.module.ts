import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HotelsListComponent } from './hotels-list/hotels-list.component';
import { HotelsAddComponent } from './hotels-add/hotels-add.component';
import { HotelDetailsComponent } from './hotel-details/hotel-details.component';
import { RoomManagementComponent } from './room-management/room-management.component';

const routes: Routes = [
  { path: '', component: HotelsListComponent },
  { path: 'add', component: HotelsAddComponent },
  { path: 'details/:id', component: HotelDetailsComponent },
  { path: 'edit/:id', component: HotelsAddComponent },
  { path: 'rooms/:id', component: RoomManagementComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HotelsRoutingModule {}
