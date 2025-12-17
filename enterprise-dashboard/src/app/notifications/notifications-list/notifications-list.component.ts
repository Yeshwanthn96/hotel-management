import { Component, OnInit } from '@angular/core';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styles: [`
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-decoration: none;
      display: inline-block;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .btn-primary {
      background: #d4af37;
      color: #1a1a1a;
    }

    .btn-primary:hover {
      background: #c29d2e;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(212, 175, 55, 0.3);
    }

    .btn-primary:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .btn-delete {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      background: #dc3545;
      color: white;
      transition: all 0.2s ease;
    }

    .btn-delete:hover {
      background: #c82333;
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(220, 53, 69, 0.4);
    }

    .btn-delete:active {
      transform: translateY(0);
    }
  `]
})
export class NotificationsListComponent implements OnInit {
  items:any[] = [];
  constructor(private svc: NotificationsService) {}
  ngOnInit() { this.load(); }
  load(){ this.svc.list().subscribe((r:any)=> this.items = r || []); }
  
  deleteNotification(item: any) {
    if (confirm(`Are you sure you want to delete this notification?\n\n"${item.title}"\n\nThis will delete it for all ${item.recipientCount} recipient(s).`)) {
      this.svc.delete(item.id).subscribe({
        next: () => {
          this.load(); // Reload the list
        },
        error: (err) => {
          console.error('Failed to delete notification:', err);
          alert('Failed to delete notification. Please try again.');
        }
      });
    }
  }
  
  formatDate(dateValue: any): string {
    if (!dateValue) return 'N/A';
    
    try {
      // Handle array format [year, month, day, hour, minute, second]
      if (Array.isArray(dateValue)) {
        const [year, month, day, hour = 0, minute = 0] = dateValue;
        const date = new Date(year, month - 1, day, hour, minute);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // Handle ISO string or Date object
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  }
}
