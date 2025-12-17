import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReviewsService, Review } from '../../services/reviews.service';
import { HotelService } from '../../services/hotel.service';
import { AuthService } from '../../auth/auth.service';

interface Hotel { id: string; name: string; }

@Component({
  selector: 'app-reviews-add',
  templateUrl: './reviews-add.component.html'
})
export class ReviewsAddComponent implements OnInit {
  hotels: Hotel[] = [];
  eligibleHotelIds: string[] = [];
  userId = '';
  selectedHotelName = '';
  hotelReviews: Review[] = [];
  existingUserReview: Review | null = null;
  isEditMode = false;
  fromQueryParam = false;
  alreadyReviewed = false;
  
  review: Review = {
    userId: '',
    hotelId: '',
    rating: 5,
    title: '',
    comment: ''
  };
  
  constructor(
    private reviewService: ReviewsService,
    private hotelService: HotelService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit() {
    // Get current user ID from auth service
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Please login to write a review');
      this.router.navigate(['/hotels']);
      return;
    }
    
    this.userId = currentUser.id;
    this.review.userId = this.userId;
    
    // Check if coming from a booking (hotelId in query params)
    this.route.queryParams.subscribe(params => {
      if (params['hotelId']) {
        this.review.hotelId = params['hotelId'];
        this.fromQueryParam = true;
      }
      if (params['bookingId']) this.review.bookingId = params['bookingId'];
    });
    
    // Load eligible hotels (where user has completed stays)
    this.loadEligibleHotels();
  }
  
  loadEligibleHotels() {
    // First, get the list of hotel IDs where user has completed stays
    this.reviewService.getEligibleHotelsForReview(this.userId).subscribe({
      next: (hotelIds) => {
        this.eligibleHotelIds = hotelIds;
        
        // If coming from a booking with hotelId, check if it's already been reviewed
        if (this.fromQueryParam && this.review.hotelId) {
          // Check if this hotel is NOT in eligible list (already reviewed)
          if (!hotelIds.includes(this.review.hotelId)) {
            // Load hotel name and set flag
            this.alreadyReviewed = true;
            this.loadHotelNameForAlreadyReviewed();
            return;
          }
        } else if (hotelIds.length === 0) {
          // Only show this error if NOT coming from a specific booking
          alert('You have no completed stays yet. Please complete a booking before writing a review.');
          this.router.navigate(['/hotels']);
          return;
        }
        
        // Then fetch hotel details for those IDs
        this.loadHotelDetails();
      },
      error: (err) => {
        console.error('Error loading eligible hotels:', err);
        alert('Unable to load hotels for review. Please try again.');
      }
    });
  }
  
  loadHotelNameForAlreadyReviewed() {
    // Load hotel name for the already-reviewed hotel
    this.hotelService.getAllHotels().subscribe({
      next: (hotels) => {
        const hotel = hotels.find(h => h.id === this.review.hotelId);
        if (hotel) {
          this.selectedHotelName = hotel.name;
        }
      },
      error: (err) => {
        console.error('Error loading hotel details:', err);
      }
    });
  }
  
  loadHotelDetails() {
    this.hotelService.getAllHotels().subscribe({
      next: (allHotels) => {
        // Filter to only show hotels where user has completed stays
        this.hotels = allHotels.filter(hotel => 
          this.eligibleHotelIds.includes(hotel.id)
        );
        
        // If hotel was pre-selected via query param, load its details and reviews
        if (this.review.hotelId) {
          const selectedHotel = this.hotels.find(h => h.id === this.review.hotelId);
          if (selectedHotel) {
            this.selectedHotelName = selectedHotel.name;
            this.onHotelChange();
          }
        }
      },
      error: (err) => {
        console.error('Error loading hotel details:', err);
      }
    });
  }
  
  onHotelChange() {
    const selectedHotel = this.hotels.find(h => h.id === this.review.hotelId);
    if (selectedHotel) {
      this.selectedHotelName = selectedHotel.name;
      this.loadHotelReviews();
    }
  }
  
  loadHotelReviews() {
    if (!this.review.hotelId) return;
    
    this.reviewService.getHotelReviews(this.review.hotelId).subscribe({
      next: (reviews) => {
        this.hotelReviews = reviews;
        // Check if user already has a review for this hotel
        this.existingUserReview = reviews.find(r => r.userId === this.userId) || null;
        if (this.existingUserReview) {
          this.isEditMode = true;
          this.review = { ...this.existingUserReview };
        }
      },
      error: (err) => {
        console.error('Error loading hotel reviews:', err);
      }
    });
  }
  
  getStars(rating: number): string {
    return '⭐'.repeat(rating);
  }
  
  editExistingReview() {
    if (this.existingUserReview) {
      this.isEditMode = true;
      this.review = { ...this.existingUserReview };
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  
  deleteExistingReview() {
    if (!this.existingUserReview || !confirm('Are you sure you want to delete your review?')) return;
    
    this.reviewService.deleteReview(this.existingUserReview.id!).subscribe({
      next: () => {
        alert('Review deleted successfully');
        this.existingUserReview = null;
        this.isEditMode = false;
        this.resetForm();
        this.loadHotelReviews();
      },
      error: (err) => {
        console.error('Error deleting review:', err);
        alert('Failed to delete review');
      }
    });
  }
  
  resetForm() {
    this.review = {
      userId: this.userId,
      hotelId: this.review.hotelId,
      rating: 5,
      title: '',
      comment: ''
    };
  }
  
  save() {
    if (!this.review.hotelId || !this.review.title || !this.review.comment) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (this.isEditMode && this.existingUserReview) {
      // Update existing review
      this.reviewService.updateReview(this.existingUserReview.id!, this.review).subscribe({
        next: () => {
          alert('Review updated successfully!');
          this.router.navigate(['/reviews']);
        },
        error: (err) => {
          console.error('Error updating review:', err);
          alert('Failed to update review. Please try again.');
        }
      });
    } else {
      // Create new review
      this.reviewService.createReview(this.review).subscribe({
        next: () => {
          alert('Review submitted successfully!');
          this.router.navigate(['/reviews']);
        },
        error: (err) => {
          console.error('Error submitting review:', err);
          alert('Failed to submit review. Please try again.');
        }
      });
    }
  }
}
