import { Component, OnInit } from '@angular/core';
import { NotificationsService, UserNotification } from '../services/notifications.service';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-notifications',
  template: `
    <div class="notifications-container">
      <div class="notifications-header">
        <h2>🔔 My Notifications</h2>
        <button *ngIf="notifications.length > 0 && hasUnread()" 
                class="mark-all-btn" 
                (click)="markAllRead()">
          Mark All as Read
        </button>
      </div>
      
      <div *ngIf="loading" class="loading">Loading notifications...</div>
      
      <div *ngIf="!loading && notifications.length === 0" class="no-notifications">
        <div class="empty-icon">📭</div>
        <p>No notifications yet</p>
        <p class="sub-text">You'll see booking updates and confirmations here</p>
      </div>
      
      <div class="notifications-list" *ngIf="!loading && notifications.length > 0">
        <div *ngFor="let notification of notifications" 
             class="notification-card"
             [class.unread]="!notification.read"
             (click)="markAsRead(notification)">
          <div class="notification-icon">
            <span *ngIf="notification.type === 'BOOKING_CONFIRMED'">✅</span>
            <span *ngIf="notification.type === 'BOOKING_REJECTED'">❌</span>
            <span *ngIf="notification.type === 'BOOKING_PENDING'">⏳</span>
            <span *ngIf="notification.type === 'PAYMENT_RECEIVED'">💳</span>
            <span *ngIf="!notification.type || notification.type === 'GENERAL'">📢</span>
          </div>
          <div class="notification-content">
            <h4>{{notification.title}}</h4>
            <p>{{notification.message}}</p>
            <span class="notification-time">{{formatDate(notification.createdAt)}}</span>
          </div>
          <div class="notification-status">
            <span *ngIf="!notification.read" class="unread-dot"></span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    
    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    
    .notifications-header h2 {
      color: #2c3e50;
      margin: 0;
    }
    
    .mark-all-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    .mark-all-btn:hover {
      background: #2980b9;
    }
    
    .loading {
      text-align: center;
      padding: 2rem;
      color: #7f8c8d;
    }
    
    .no-notifications {
      text-align: center;
      padding: 3rem;
      background: #f9f9f9;
      border-radius: 10px;
    }
    
    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    
    .no-notifications p {
      color: #7f8c8d;
      margin: 0.5rem 0;
    }
    
    .sub-text {
      font-size: 0.9rem;
    }
    
    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .notification-card {
      display: flex;
      align-items: flex-start;
      padding: 1rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .notification-card:hover {
      transform: translateX(5px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }
    
    .notification-card.unread {
      background: linear-gradient(to right, #e8f4fd, white);
      border-left: 4px solid #3498db;
    }
    
    .notification-icon {
      font-size: 1.5rem;
      margin-right: 1rem;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f0f0;
      border-radius: 50%;
    }
    
    .notification-content {
      flex: 1;
    }
    
    .notification-content h4 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
    }
    
    .notification-content p {
      margin: 0 0 0.5rem 0;
      color: #7f8c8d;
      font-size: 0.9rem;
    }
    
    .notification-time {
      font-size: 0.8rem;
      color: #95a5a6;
    }
    
    .notification-status {
      display: flex;
      align-items: center;
      padding-left: 1rem;
    }
    
    .unread-dot {
      width: 10px;
      height: 10px;
      background: #3498db;
      border-radius: 50%;
    }
  `]
})
export class UserNotificationsComponent implements OnInit {
  notifications: UserNotification[] = [];
  loading = true;
  
  constructor(
    private notificationService: NotificationsService,
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadNotifications();
  }
  
  loadNotifications() {
    const userId = this.authService.getCurrentUser()?.id;
    if (userId) {
      this.notificationService.getUserNotifications(userId).subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load notifications:', err);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }
  
  hasUnread(): boolean {
    return this.notifications.some(n => !n.read);
  }
  
  markAsRead(notification: UserNotification) {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: (updated) => {
          notification.read = true;
        },
        error: (err) => console.error('Failed to mark as read:', err)
      });
    }
  }
  
  markAllRead() {
    const userId = this.authService.getCurrentUser()?.id;
    if (userId) {
      this.notificationService.markAllAsRead(userId).subscribe({
        next: () => {
          this.notifications.forEach(n => n.read = true);
        },
        error: (err) => console.error('Failed to mark all as read:', err)
      });
    }
  }
  
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}
