import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { JwtInterceptor } from './auth/jwt.interceptor';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: '', redirectTo: 'hotels', pathMatch: 'full' },
      { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
      { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
      
      // ADMIN ONLY ROUTES
      { 
        path: 'admin', 
        loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      { 
        path: 'users', 
        loadChildren: () => import('./users/users.module').then(m => m.UsersModule),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      { 
        path: 'reviews', 
        loadChildren: () => import('./reviews/reviews.module').then(m => m.ReviewsModule)
      },
      { 
        path: 'notifications', 
        loadChildren: () => import('./notifications/notifications.module').then(m => m.NotificationsModule),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      
      // USER ACCESSIBLE ROUTES
      { 
        path: 'dashboard', 
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      { 
        path: 'hotels', 
        loadChildren: () => import('./hotels/hotels.module').then(m => m.HotelsModule)
      },
      { 
        path: 'bookings', 
        loadChildren: () => import('./bookings/bookings.module').then(m => m.BookingsModule),
        canActivate: [AuthGuard]
      },
      { 
        path: 'payments', 
        loadChildren: () => import('./payments/payments.module').then(m => m.PaymentsModule),
        canActivate: [AuthGuard]
      },
      { 
        path: 'user-notifications', 
        loadChildren: () => import('./user-notifications/user-notifications.module').then(m => m.UserNotificationsModule),
        canActivate: [AuthGuard]
      },
      { 
        path: 'my-reviews', 
        loadChildren: () => import('./my-reviews/my-reviews.module').then(m => m.MyReviewsModule),
        canActivate: [AuthGuard]
      }
    ])
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
