import { Component, OnInit } from '@angular/core';
import { ReviewsService, Review } from '../../services/reviews.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-reviews-list',
  templateUrl: './reviews-list.component.html'
})
export class ReviewsListComponent implements OnInit {
  reviews: Review[] = [];
  userId: string | null = null;
  
  constructor(
    private reviewService: ReviewsService,
    public authService: AuthService
  ) {}
  
  ngOnInit() {
    this.userId = this.authService.getUserId();
    this.loadReviews();
  }
  
  loadReviews() {
    // Admin sees all reviews with moderation options, users see their own
    if (this.authService.isAdmin()) {
      this.reviewService.getAllReviews().subscribe({
        next: (data) => this.reviews = data,
        error: (err) => console.error('Failed to load all reviews:', err)
      });
    } else if (this.userId) {
      this.reviewService.getUserReviews(this.userId).subscribe({
        next: (data) => this.reviews = data,
        error: (err) => console.error('Failed to load user reviews:', err)
      });
    }
  }
  
  deleteReview(review: Review) {
    if (!review.id) return;
    if (!confirm(`Delete review for ${review.title}?`)) return;
    
    this.reviewService.deleteReview(review.id).subscribe({
      next: () => {
        alert('Review deleted');
        this.loadReviews();
      },
      error: (err) => alert(`Delete failed: ${err.message}`)
    });
  }
  
  approveReview(review: Review) {
    if (!review.id) return;
    
    this.reviewService.approveReview(review.id).subscribe({
      next: () => {
        alert('Review approved');
        this.loadReviews();
      },
      error: (err) => alert(`Approve failed: ${err.message}`)
    });
  }
  
  rejectReview(review: Review) {
    if (!review.id) return;
    
    this.reviewService.rejectReview(review.id).subscribe({
      next: () => {
        alert('Review rejected');
        this.loadReviews();
      },
      error: (err) => alert(`Reject failed: ${err.message}`)
    });
  }
  
  getStars(rating: number): string {
    return '⭐'.repeat(rating);
  }
}
