import { Component, OnInit } from '@angular/core';
import { BookingsService, Booking } from '../../services/bookings.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-bookings-list',
  templateUrl: './bookings-list.component.html'
})
export class BookingsListComponent implements OnInit {
  bookings: Booking[] = [];
  userId: string | null = null;
  
  constructor(
    private bookingService: BookingsService,
    public authService: AuthService
  ) {}
  
  ngOnInit() {
    this.userId = this.authService.getUserId();
    this.loadBookings();
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
  
  getStatusBadgeClass(status: string): string {
    const statusMap: any = {
      'CONFIRMED': 'success',
      'PENDING': 'warning',
      'ROOM_HELD': 'info',
      'PAYMENT_PENDING': 'info',
      'CANCELLED': 'danger',
      'FAILED': 'danger'
    };
    return statusMap[status] || 'secondary';
  }
  
  cancelBooking(booking: Booking) {
    if (!booking.id) return;
    if (!confirm(`Cancel booking for ${booking.hotelId}?`)) return;
    
    this.bookingService.cancelBooking(booking.id, 'User requested cancellation').subscribe({
      next: () => {
        alert('Booking cancelled');
        this.loadBookings();
      },
      error: (err) => alert(`Cancel failed: ${err.error?.message || err.message}`)
    });
  }
}
