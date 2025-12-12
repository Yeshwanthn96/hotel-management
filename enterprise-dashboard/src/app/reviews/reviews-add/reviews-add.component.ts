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
    
    // Load eligible hotels (where user has completed stays)
    this.loadEligibleHotels();
    
    this.route.queryParams.subscribe(params => {
      if (params['hotelId']) this.review.hotelId = params['hotelId'];
      if (params['bookingId']) this.review.bookingId = params['bookingId'];
    });
  }
  
  loadEligibleHotels() {
    // First, get the list of hotel IDs where user has completed stays
    this.reviewService.getEligibleHotelsForReview(this.userId).subscribe({
      next: (hotelIds) => {
        this.eligibleHotelIds = hotelIds;
        if (hotelIds.length === 0) {
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
  
  loadHotelDetails() {
    this.hotelService.getAllHotels().subscribe({
      next: (allHotels) => {
        // Filter to only show hotels where user has completed stays
        this.hotels = allHotels.filter(hotel => 
          this.eligibleHotelIds.includes(hotel.id)
        );
      },
      error: (err) => {
        console.error('Error loading hotel details:', err);
      }
    });
  }
  
  save() {
    if (!this.review.hotelId || !this.review.title || !this.review.comment) {
      alert('Please fill in all required fields');
      return;
    }
    
    this.reviewService.createReview(this.review).subscribe({
      next: () => {
        alert('Review submitted successfully!');
        this.router.navigate(['/reviews']);
      },
      error: (err) => {
        const errorMsg = err.error?.error || err.message || 'Failed to submit review';
        alert(errorMsg);
      }
    });
  }
}
