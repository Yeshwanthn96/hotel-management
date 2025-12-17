import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="luxury-header">
      <div class="logo">LUXURY HOTELS</div>
      <nav>
        <a routerLink="/hotels" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}">HOTELS</a>
        
        <!-- User Menu Items -->
        <a *ngIf="isLoggedIn() && !isAdmin()" routerLink="/bookings" routerLinkActive="active">MY BOOKINGS</a>
        <a *ngIf="isLoggedIn() && !isAdmin()" routerLink="/my-reviews" routerLinkActive="active">MY REVIEWS</a>
        <a *ngIf="isLoggedIn() && !isAdmin()" routerLink="/user-notifications" routerLinkActive="active">
          NOTIFICATIONS
          <span *ngIf="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
        </a>
        
        <!-- Admin Menu Items -->
        <a *ngIf="isAdmin()" routerLink="/admin/dashboard" routerLinkActive="active">DASHBOARD</a>
        <a *ngIf="isAdmin()" routerLink="/admin/hotels" routerLinkActive="active">MANAGE HOTELS</a>
        <a *ngIf="isAdmin()" routerLink="/bookings" routerLinkActive="active">ALL BOOKINGS</a>
        <a *ngIf="isAdmin()" routerLink="/users" routerLinkActive="active">USERS</a>
        <a *ngIf="isAdmin()" routerLink="/reviews" routerLinkActive="active">REVIEWS</a>
        <a *ngIf="isAdmin()" routerLink="/notifications" routerLinkActive="active">NOTIFICATIONS</a>
        
        <a *ngIf="!isLoggedIn()" routerLink="/auth/login" class="login-btn">Login</a>
        <div *ngIf="isLoggedIn()" style="display: flex; align-items: center; gap: 15px;">
          <span style="color: #d4af37; font-size: 14px;">{{ getUserEmail() }} ({{ getUserRole() }})</span>
          <button class="login-btn" (click)="logout()">Logout</button>
        </div>
      </nav>
    </div>
    
    <div *ngIf="showHero()" class="hero-section">
      <div class="hero-content">
        <h1>EXPERIENCE LUXURY</h1>
        <p>Discover unparalleled elegance and world-class hospitality</p>
        <button class="hero-btn" (click)="exploreHotels()">EXPLORE HOTELS</button>
      </div>
    </div>

    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {
  unreadCount: number = 0;
  private notificationApiUrl = 'http://localhost:8080/api/notifications';

  constructor(
    private router: Router, 
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Load unread count if user is logged in
    this.loadUnreadCount();
    // Reload count periodically
    setInterval(() => this.loadUnreadCount(), 30000); // Every 30 seconds
  }

  loadUnreadCount() {
    if (this.isLoggedIn() && !this.isAdmin()) {
      const userId = this.authService.getCurrentUser()?.id;
      if (userId) {
        this.http.get<{count: number}>(`${this.notificationApiUrl}/user/${userId}/unread-count`)
          .subscribe({
            next: (response) => this.unreadCount = response.count || 0,
            error: () => this.unreadCount = 0
          });
      }
    }
  }

  showHero() {
    return this.router.url === '/' || this.router.url === '/hotels';
  }

  isLoggedIn() {
    return this.authService.isAuthenticated();
  }

  isAdmin() {
    return this.authService.isAdmin();
  }

  getUserEmail() {
    return this.authService.getCurrentUser()?.email || '';
  }

  getUserRole() {
    const role = this.authService.getUserRole();
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      alert('You have been logged out successfully');
      // Navigate and replace history to prevent back button access
      this.router.navigate(['/hotels']).then(() => {
        window.location.reload(); // Force reload to clear component state
      });
    }
  }

  exploreHotels() {
    this.router.navigate(['/hotels']);
  }
}
