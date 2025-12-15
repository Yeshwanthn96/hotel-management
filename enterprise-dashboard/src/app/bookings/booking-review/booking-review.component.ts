import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BookingsService } from '../bookings.service';
import { ReviewsService, Review } from '../../services/reviews.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-booking-review',
  templateUrl: './booking-review.component.html',
  styleUrls: ['./booking-review.component.css']
})
export class BookingReviewComponent implements OnInit {
  booking: any = null;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  bookingId: string = '';
  
  review: Review = {
    userId: '',
    hotelId: '',
    bookingId: '',
    rating: 5,
    title: '',
    comment: ''
  };

  constructor(
    private bookingsService: BookingsService,
    private reviewService: ReviewsService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Please login to write a review');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.review.userId = currentUser.id;
    
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
        
        // Check if booking is completed
        if (this.booking.status !== 'COMPLETED') {
          this.errorMessage = 'You can only review completed stays.';
          this.isLoading = false;
          return;
        }
        
        // Pre-fill review data
        this.review.hotelId = this.booking.hotelId;
        this.review.bookingId = this.booking.id;
        
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load booking details';
        this.isLoading = false;
      }
    });
  }

  setRating(rating: number) {
    this.review.rating = rating;
  }

  submitReview() {
    // Validation
    if (!this.review.title || this.review.title.trim().length === 0) {
      alert('Please enter a review title');
      return;
    }
    
    if (!this.review.comment || this.review.comment.trim().length === 0) {
      alert('Please enter your review');
      return;
    }
    
    if (this.review.comment.length > 1000) {
      alert('Review is too long. Maximum 1000 characters allowed.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    this.reviewService.createReview(this.review).subscribe({
      next: (response) => {
        this.successMessage = 'Review submitted successfully! It will be visible after admin approval.';
        setTimeout(() => {
          this.router.navigate(['/bookings']);
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to submit review. Please try again.';
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/bookings/details', this.bookingId]);
  }
}
