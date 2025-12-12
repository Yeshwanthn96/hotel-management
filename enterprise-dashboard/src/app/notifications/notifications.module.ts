import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsListComponent } from './notifications-list/notifications-list.component';
import { NotificationsAddComponent } from './notifications-add/notifications-add.component';

@NgModule({
  declarations: [NotificationsListComponent, NotificationsAddComponent],
  imports: [CommonModule, FormsModule, NotificationsRoutingModule]
})
export class NotificationsModule {}
