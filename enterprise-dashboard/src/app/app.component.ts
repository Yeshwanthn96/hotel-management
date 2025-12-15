import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="luxury-header">
      <div class="logo">LUXURY HOTELS</div>
      <nav>
        <a routerLink="/hotels" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}">Hotels</a>
        <a *ngIf="isLoggedIn()" routerLink="/bookings" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}">Bookings</a>
        <a *ngIf="isLoggedIn()" routerLink="/payments" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}">Payments</a>
        <a *ngIf="isAdmin()" routerLink="/admin/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}">Admin Dashboard</a>
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
export class AppComponent {
  constructor(private router: Router, private authService: AuthService) {}

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
