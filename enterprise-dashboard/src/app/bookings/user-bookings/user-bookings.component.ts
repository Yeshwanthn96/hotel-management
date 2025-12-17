import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingsService } from '../bookings.service';
import { AuthService } from '../../auth/auth.service';
import { ReviewsService } from '../../services/reviews.service';

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
  reviewedHotelIds: Set<string> = new Set();

  constructor(
    private bookingsService: BookingsService,
    private authService: AuthService,
    private reviewsService: ReviewsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadUserData();
    }
  }

  loadUserData() {
    this.isLoading = true;
    
    // Load user reviews first to know which hotels have been reviewed
    this.reviewsService.getUserReviews(this.currentUser.id).subscribe({
      next: (reviews) => {
        this.reviewedHotelIds = new Set(reviews.map(r => r.hotelId));
        this.loadUserBookings();
      },
      error: () => {
        // If reviews fail to load, still load bookings
        this.loadUserBookings();
      }
    });
  }

  loadUserBookings() {
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

  hasReviewedHotel(hotelId: string): boolean {
    return this.reviewedHotelIds.has(hotelId);
  }

  getStatusClass(status: string): string {
    const statusMap: any = {
      'CONFIRMED': 'status-confirmed',
      'PENDING': 'status-pending',
      'CANCELLED': 'status-cancelled',
      'STAY_COMPLETED': 'status-completed',
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
