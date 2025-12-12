import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminHotelsComponent } from './admin-hotels/admin-hotels.component';
import { AdminServicesComponent } from './admin-services/admin-services.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';


@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminLayoutComponent,
    AdminHotelsComponent,
    AdminServicesComponent,
    AdminUsersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
