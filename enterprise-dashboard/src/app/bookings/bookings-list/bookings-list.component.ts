import { Component, OnInit } from '@angular/core';
import { BookingsService, Booking } from '../../services/bookings.service';
import { AuthService } from '../../auth/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-bookings-list',
  templateUrl: './bookings-list.component.html'
})
export class BookingsListComponent implements OnInit {
  bookings: Booking[] = [];
  userId: string | null = null;
  hotels: Map<string, any> = new Map();
  users: Map<string, any> = new Map();
  statusFilter: string = 'ALL';
  
  constructor(
    private bookingService: BookingsService,
    public authService: AuthService,
    private http: HttpClient
  ) {}
  
  ngOnInit() {
    this.userId = this.authService.getUserId();
    this.loadHotelsAndUsers();
    this.loadBookings();
  }

  loadHotelsAndUsers() {
    // Load hotels
    this.http.get<any[]>('/api/hotels').subscribe({
      next: (hotels) => hotels.forEach(h => this.hotels.set(h.id, h)),
      error: (err) => console.error('Failed to load hotels:', err)
    });
    
    // Load users if admin
    if (this.authService.isAdmin()) {
      this.http.get<any>('/api/users/all').subscribe({
        next: (response) => {
          const userList = response.users || response || [];
          userList.forEach((u: any) => this.users.set(u.id, u));
        },
        error: (err) => console.error('Failed to load users:', err)
      });
    }
  }
  
  loadBookings() {
    // Admin sees all bookings, users see their own
    if (this.authService.isAdmin()) {
      this.bookingService.getAllBookings().subscribe({
        next: (data) => this.bookings = data,
        error: (err) => console.error('Failed to load all bookings:', err)
      });
    } else if (this.userId) {
      this.bookingService.getUserBookings(this.userId).subscribe({
        next: (data) => this.bookings = data,
        error: (err) => console.error('Failed to load user bookings:', err)
      });
    }
  }

  getHotelName(hotelId: string): string {
    const hotel = this.hotels.get(hotelId);
    return hotel ? hotel.name : hotelId;
  }

  getUserName(userId: string): string {
    const user = this.users.get(userId);
    return user ? `${user.firstName} ${user.lastName}` : userId;
  }

  getUserEmail(userId: string): string {
    const user = this.users.get(userId);
    return user ? user.email : '';
  }

  get filteredBookings() {
    if (this.statusFilter === 'ALL') return this.bookings;
    return this.bookings.filter(b => b.status === this.statusFilter);
  }
  
  getStatusBadgeClass(status: string): string {
    const statusMap: any = {
      'CONFIRMED': 'success',
      'PENDING': 'warning',
      'ROOM_HELD': 'info',
      'PAYMENT_PENDING': 'info',
      'ON_HOLD': 'warning',
      'CANCELLED': 'danger',
      'REJECTED': 'danger',
      'FAILED': 'danger',
      'COMPLETED': 'success'
    };
    return statusMap[status] || 'secondary';
  }
  
  confirmBooking(booking: Booking) {
    if (!booking.id) return;
    if (!confirm(`Confirm booking for ${this.getHotelName(booking.hotelId)}?`)) return;
    
    this.bookingService.confirmBooking(booking.id, 'ADMIN_CONFIRMED').subscribe({
      next: () => {
        alert('Booking confirmed! Notification sent to user.');
        this.loadBookings();
      },
      error: (err) => alert(`Confirm failed: ${err.error?.message || err.message}`)
    });
  }

  holdBooking(booking: Booking) {
    if (!booking.id) return;
    const reason = prompt('Enter reason for holding this booking:');
    if (!reason) return;
    
    this.http.put(`/api/bookings/${booking.id}/hold`, { reason }).subscribe({
      next: () => {
        alert('Booking put on hold.');
        this.loadBookings();
      },
      error: (err: any) => alert(`Hold failed: ${err.error?.message || err.message}`)
    });
  }

  resumeBooking(booking: Booking) {
    if (!booking.id) return;
    if (!confirm('Resume this booking from hold?')) return;
    
    this.http.put(`/api/bookings/${booking.id}/resume`, {}).subscribe({
      next: () => {
        alert('Booking resumed.');
        this.loadBookings();
      },
      error: (err: any) => alert(`Resume failed: ${err.error?.message || err.message}`)
    });
  }

  rejectBooking(booking: Booking) {
    if (!booking.id) return;
    const reason = prompt('Enter reason for rejecting this booking:');
    if (!reason) return;
    
    this.http.put(`/api/bookings/${booking.id}/reject`, { reason }).subscribe({
      next: () => {
        alert('Booking rejected and refund initiated.');
        this.loadBookings();
      },
      error: (err: any) => alert(`Reject failed: ${err.error?.message || err.message}`)
    });
  }

  cancelBooking(booking: Booking) {
    if (!booking.id) return;
    if (!confirm(`Cancel booking for ${this.getHotelName(booking.hotelId)}?`)) return;
    
    this.bookingService.cancelBooking(booking.id, 'User requested cancellation').subscribe({
      next: () => {
        alert('Booking cancelled');
        this.loadBookings();
      },
      error: (err) => alert(`Cancel failed: ${err.error?.message || err.message}`)
    });
  }
}
