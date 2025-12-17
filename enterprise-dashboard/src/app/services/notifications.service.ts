import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  bookingId?: string;
  read: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  base = '/api/notifications';
  constructor(private http: HttpClient) {}
  
  // Admin notification methods
  list(): Observable<any> { return this.http.get(this.base); }
  add(data:any): Observable<any> { return this.http.post(this.base, data); }
  
  // User notification methods
  getUserNotifications(userId: string): Observable<UserNotification[]> {
    return this.http.get<UserNotification[]>(`${this.base}/user/${userId}`);
  }
  
  getUnreadCount(userId: string): Observable<number> {
    return this.http.get<number>(`${this.base}/user/${userId}/unread-count`);
  }
  
  markAsRead(notificationId: string): Observable<UserNotification> {
    return this.http.put<UserNotification>(`${this.base}/${notificationId}/read`, {});
  }
  
  markAllAsRead(userId: string): Observable<void> {
    return this.http.put<void>(`${this.base}/user/${userId}/read-all`, {});
  }
}
