import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationsListComponent } from './notifications-list/notifications-list.component';
import { NotificationsAddComponent } from './notifications-add/notifications-add.component';

const routes: Routes = [
  { path: '', component: NotificationsListComponent },
  { path: 'add', component: NotificationsAddComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationsRoutingModule {}
