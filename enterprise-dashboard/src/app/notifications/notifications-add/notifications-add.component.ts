import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-notifications-add',
  templateUrl: './notifications-add.component.html',
  styles: [`
    .container {
      max-width: 700px;
      margin: 30px auto;
      padding: 20px;
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .card-title {
      color: #2c3e50;
      font-size: 22px;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid #d4af37;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.3s;
      box-sizing: border-box;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: #d4af37;
    }

    .form-group textarea {
      resize: vertical;
      font-family: inherit;
    }

    .flex {
      display: flex;
      gap: 12px;
      margin-top: 25px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .btn-primary {
      background: #d4af37;
      color: #1a1a1a;
    }

    .btn-primary:hover:not(:disabled) {
      background: #c29d2e;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class NotificationsAddComponent {
  title = '';
  message = '';
  type = 'info';
  loading = false;
  
  constructor(private svc: NotificationsService, private router: Router) {}
  
  save() {
    if (!this.title.trim() || !this.message.trim()) {
      alert('Please fill in all fields');
      return;
    }
    
    this.loading = true;
    const payload = {
      title: this.title,
      message: this.message,
      type: this.type
    };
    
    this.svc.sendBulkNotification(payload).subscribe({
      next: () => {
        this.loading = false;
        alert('Notification sent successfully to all users!');
        this.router.navigate(['/notifications']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error sending notification:', err);
        alert('Failed to send notification. Please try again.');
      }
    });
  }
}
