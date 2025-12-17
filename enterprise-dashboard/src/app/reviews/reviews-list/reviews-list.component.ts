import { Component, OnInit } from '@angular/core';
import { ReviewsService, Review } from '../../services/reviews.service';
import { AuthService } from '../../auth/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reviews-list',
  templateUrl: './reviews-list.component.html'
})
export class ReviewsListComponent implements OnInit {
  reviews: Review[] = [];
  userId: string | null = null;
  hotels: Map<string, any> = new Map();
  users: Map<string, any> = new Map();
  showReplyModal = false;
  showAdminReplyModal = false;
  selectedReview: Review | null = null;
  userReply = '';
  adminReply = '';
  
  constructor(
    private reviewService: ReviewsService,
    public authService: AuthService,
    private http: HttpClient
  ) {}
  
  ngOnInit() {
    this.userId = this.authService.getUserId();
    this.loadHotels();
    if (this.authService.isAdmin()) {
      this.loadUsers();
    }
    this.loadReviews();
  }

  loadHotels() {
    this.http.get<any[]>('/api/hotels').subscribe({
      next: (hotels) => hotels.forEach(h => this.hotels.set(h.id, h)),
      error: (err) => console.error('Failed to load hotels:', err)
    });
  }

  loadUsers() {
    this.http.get<any>('/api/users/all').subscribe({
      next: (response) => {
        const userList = response.users || response || [];
        userList.forEach((u: any) => this.users.set(u.id, u));
      },
      error: (err) => console.error('Failed to load users:', err)
    });
  }

  getHotelName(hotelId: string): string {
    const hotel = this.hotels.get(hotelId);
    return hotel ? hotel.name : hotelId;
  }

  getUserName(userId: string): string {
    const user = this.users.get(userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Anonymous';
  }
  
  loadReviews() {
    // Admin sees all reviews with moderation options, users see their own
    if (this.authService.isAdmin()) {
      this.reviewService.getAllReviews().subscribe({
        next: (data) => {
          // Enrich with user names
          this.reviews = data.map(review => ({
            ...review,
            userName: this.getUserName(review.userId)
          }));
        },
        error: (err) => console.error('Failed to load all reviews:', err)
      });
    } else if (this.userId) {
      this.reviewService.getUserReviews(this.userId).subscribe({
        next: (data) => this.reviews = data,
        error: (err) => console.error('Failed to load user reviews:', err)
      });
    }
  }

  openReplyModal(review: Review) {
    this.selectedReview = review;
    this.userReply = '';
    this.showReplyModal = true;
  }

  closeReplyModal() {
    this.showReplyModal = false;
    this.selectedReview = null;
    this.userReply = '';
  }

  submitUserReply() {
    if (!this.selectedReview || !this.userReply.trim()) return;
    
    // User can reply back to admin's reply
    this.http.post(`/api/reviews/${this.selectedReview.id}/user-reply`, { reply: this.userReply }).subscribe({
      next: () => {
        alert('Reply submitted successfully!');
        this.closeReplyModal();
        this.loadReviews();
      },
      error: (err: any) => alert('Failed to submit reply: ' + (err.error?.message || err.message))
    });
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

  // Admin reply methods
  openAdminReplyModal(review: Review) {
    this.selectedReview = review;
    this.adminReply = review.adminReply || '';
    this.showAdminReplyModal = true;
  }

  closeAdminReplyModal() {
    this.showAdminReplyModal = false;
    this.selectedReview = null;
    this.adminReply = '';
  }

  submitAdminReply() {
    if (!this.selectedReview || !this.adminReply.trim()) return;
    
    this.http.post(`/api/reviews/${this.selectedReview.id}/reply`, { reply: this.adminReply }).subscribe({
      next: () => {
        alert('Response posted successfully!');
        this.closeAdminReplyModal();
        this.loadReviews();
      },
      error: (err: any) => alert('Failed to post response: ' + (err.error?.message || err.message))
    });
  }
}
