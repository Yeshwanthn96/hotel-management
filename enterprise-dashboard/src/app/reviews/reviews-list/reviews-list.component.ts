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
  groupedReviews: Map<string, Review[]> = new Map();
  userId: string | null = null;
  hotels: Map<string, any> = new Map();
  users: Map<string, any> = new Map();
  showReplyModal = false;
  showAdminReplyModal = false;
  showEditModal = false;
  showEditUserReplyModal = false;
  selectedReview: Review | null = null;
  userReply = '';
  adminReply = '';
  editComment = '';
  editRating = 5;
  editUserReply = '';
  
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
    // Admin sees all reviews, users see their own
    if (this.authService.isAdmin()) {
      this.reviewService.getAllReviews().subscribe({
        next: (data) => {
          // Enrich with user names
          this.reviews = data.map(review => ({
            ...review,
            userName: this.getUserName(review.userId)
          }));
          this.groupReviewsByHotel();
        },
        error: (err) => console.error('Failed to load all reviews:', err)
      });
    } else if (this.userId) {
      this.reviewService.getUserReviews(this.userId).subscribe({
        next: (data) => {
          this.reviews = data;
          this.groupReviewsByHotel();
        },
        error: (err) => console.error('Failed to load user reviews:', err)
      });
    }
  }

  groupReviewsByHotel() {
    this.groupedReviews.clear();
    this.reviews.forEach(review => {
      const hotelId = review.hotelId;
      if (!this.groupedReviews.has(hotelId)) {
        this.groupedReviews.set(hotelId, []);
      }
      this.groupedReviews.get(hotelId)!.push(review);
    });
  }

  getHotelIds(): string[] {
    return Array.from(this.groupedReviews.keys());
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
    this.reviewService.addUserReply(this.selectedReview.id!, this.userReply).subscribe({
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
    const confirmMsg = this.authService.isAdmin() 
      ? `Delete this review by ${review.userName || 'user'}?`
      : `Delete your review for ${this.getHotelName(review.hotelId)}?`;
    
    if (!confirm(confirmMsg)) return;
    
    this.reviewService.deleteReview(review.id).subscribe({
      next: () => {
        alert('Review deleted successfully');
        this.loadReviews();
      },
      error: (err) => alert(`Delete failed: ${err.message}`)
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
    
    this.reviewService.addAdminReply(this.selectedReview.id!, this.adminReply).subscribe({
      next: () => {
        alert('Response posted successfully!');
        this.closeAdminReplyModal();
        this.loadReviews();
      },
      error: (err: any) => alert('Failed to post response: ' + (err.error?.message || err.message))
    });
  }

  // User edit review methods
  openEditModal(review: Review) {
    this.selectedReview = review;
    this.editComment = review.comment;
    this.editRating = review.rating;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedReview = null;
    this.editComment = '';
    this.editRating = 5;
  }

  submitEditReview() {
    if (!this.selectedReview || !this.editComment.trim()) return;
    
    const updateData = {
      comment: this.editComment,
      rating: this.editRating
    };
    
    this.reviewService.updateReview(this.selectedReview.id!, updateData).subscribe({
      next: () => {
        alert('Review updated successfully!');
        this.closeEditModal();
        this.loadReviews();
      },
      error: (err: any) => alert('Failed to update review: ' + (err.error?.message || err.message))
    });
  }

  canEditReview(review: Review): boolean {
    return !this.authService.isAdmin() && review.userId === this.userId;
  }

  // User edit their own reply to hotel
  openEditUserReplyModal(review: Review) {
    this.selectedReview = review;
    this.editUserReply = review.userReply || '';
    this.showEditUserReplyModal = true;
  }

  closeEditUserReplyModal() {
    this.showEditUserReplyModal = false;
    this.selectedReview = null;
    this.editUserReply = '';
  }

  submitEditUserReply() {
    if (!this.selectedReview || !this.editUserReply.trim()) return;
    
    this.reviewService.addUserReply(this.selectedReview.id!, this.editUserReply).subscribe({
      next: () => {
        alert('Reply updated successfully!');
        this.closeEditUserReplyModal();
        this.loadReviews();
      },
      error: (err: any) => alert('Failed to update reply: ' + (err.error?.message || err.message))
    });
  }
}
