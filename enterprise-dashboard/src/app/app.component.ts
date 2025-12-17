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
        <a *ngIf="isLoggedIn() && !isAdmin()" routerLink="/user-notifications" routerLinkActive="active" class="notification-link">
          🔔
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
          <button class="login-btn" (click)="showLogoutModal = true">Logout</button>
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

    <!-- Logout Confirmation Modal -->
    <div *ngIf="showLogoutModal" class="modal-overlay" (click)="showLogoutModal = false">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Confirm Logout</h3>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to logout?</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" (click)="showLogoutModal = false">Cancel</button>
          <button class="btn-confirm" (click)="confirmLogout()">Logout</button>
        </div>
      </div>
    </div>

    <router-outlet></router-outlet>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 90%;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 20px;
      font-weight: 600;
    }

    .modal-body {
      padding: 24px;
    }

    .modal-body p {
      margin: 0;
      color: #555;
      font-size: 16px;
      line-height: 1.5;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn-cancel, .btn-confirm {
      padding: 10px 24px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-cancel {
      background: #f5f5f5;
      color: #666;
    }

    .btn-cancel:hover {
      background: #e0e0e0;
    }

    .btn-confirm {
      background: #d4af37;
      color: white;
    }

    .btn-confirm:hover {
      background: #c29d2e;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
    }
  `]
})
export class AppComponent implements OnInit {
  unreadCount: number = 0;
  showLogoutModal = false;
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

  openLogoutModal() {
    this.showLogoutModal = true;
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
  }

  confirmLogout() {
    this.authService.logout();
    this.showLogoutModal = false;
    this.router.navigate(['/hotels']).then(() => {
      window.location.reload();
    });
  }

  logout() {
    this.openLogoutModal();
  }

  exploreHotels() {
    this.router.navigate(['/hotels']);
  }
}
