import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingsService } from '../bookings.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-user-bookings',
  templateUrl: './user-bookings.component.html',
  styleUrls: ['./user-bookings.component.css']
})
export class UserBookingsComponent implements OnInit {
  bookings: any[] = [];
  isLoading = true;
  errorMessage = '';
  currentUser: any;

  constructor(
    private bookingsService: BookingsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadUserBookings();
    }
  }

  loadUserBookings() {
    this.isLoading = true;
    // Load only bookings for the current user
    this.bookingsService.getUserBookings(this.currentUser.id).subscribe({
      next: (data) => {
        this.bookings = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load your bookings';
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const statusMap: any = {
      'CONFIRMED': 'status-confirmed',
      'PENDING': 'status-pending',
      'CANCELLED': 'status-cancelled',
      'COMPLETED': 'status-completed'
    };
    return statusMap[status] || 'status-pending';
  }

  cancelBooking(bookingId: string) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingsService.cancelBooking(bookingId).subscribe({
        next: () => {
          alert('Booking cancelled successfully');
          this.loadUserBookings();
        },
        error: () => {
          alert('Failed to cancel booking');
        }
      });
    }
  }
}
