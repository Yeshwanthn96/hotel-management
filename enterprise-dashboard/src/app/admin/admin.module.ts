import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminHotelsComponent } from './admin-hotels/admin-hotels.component';
import { AdminServicesComponent } from './admin-services/admin-services.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { ServiceManagementComponent } from './services/service-management.component';
import { ReviewModerationComponent } from './reviews/review-moderation.component';
import { NotificationManagementComponent } from './notifications/notification-management.component';


@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminLayoutComponent,
    AdminHotelsComponent,
    AdminServicesComponent,
    AdminUsersComponent,
    ServiceManagementComponent,
    ReviewModerationComponent,
    NotificationManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
