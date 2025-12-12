import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminHotelsComponent } from './admin-hotels/admin-hotels.component';
import { AdminServicesComponent } from './admin-services/admin-services.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'hotels', component: AdminHotelsComponent },
      { path: 'services', component: AdminServicesComponent },
      { path: 'users', component: AdminUsersComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
