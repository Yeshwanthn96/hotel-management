import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingsService } from '../bookings.service';

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.css']
})
export class BookingDetailsComponent implements OnInit {
  booking: any = null;
  isLoading = true;
  errorMessage = '';
  bookingId: string = '';

  constructor(
    private bookingsService: BookingsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.bookingId = this.route.snapshot.paramMap.get('id') || '';
    if (this.bookingId) {
      this.loadBookingDetails();
    }
  }

  loadBookingDetails() {
    this.isLoading = true;
    this.bookingsService.getBookingById(this.bookingId).subscribe({
      next: (data) => {
        this.booking = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load booking details';
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const statusMap: any = {
      'CONFIRMED': 'status-confirmed',
      'PENDING': 'status-pending',
      'CANCELLED': 'status-cancelled',
      'COMPLETED': 'status-completed',
      'PAYMENT_PENDING': 'status-pending'
    };
    return statusMap[status] || 'status-pending';
  }

  goBack() {
    this.router.navigate(['/bookings']);
  }

  calculateDuration(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  cancelBooking() {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingsService.cancelBooking(this.bookingId).subscribe({
        next: () => {
          alert('Booking cancelled successfully');
          this.router.navigate(['/bookings']);
        },
        error: () => {
          alert('Failed to cancel booking');
        }
      });
    }
  }
}
