import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  sidebarCollapsed = false;
  currentUser: any;

  menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard', active: true },
    { path: '/admin/hotels', icon: '🏨', label: 'Hotels', active: false },
    { path: '/admin/services', icon: '🛎️', label: 'Services', active: false },
    { path: '/hotels', icon: '🏢', label: 'Room Management', active: false },
    { path: '/bookings', icon: '📅', label: 'Bookings', active: false },
    { path: '/admin/users', icon: '👥', label: 'Users', active: false },
    { path: '/reviews', icon: '⭐', label: 'Reviews', active: false },
    { path: '/payments', icon: '💳', label: 'Payments', active: false },
    { path: '/analytics', icon: '📈', label: 'Analytics', active: false }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.menuItems.forEach(item => item.active = item.path === path);
  }
}
