import { Component, OnInit } from '@angular/core';
import { ReviewsService, Review } from '../services/reviews.service';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Hotel {
  id: string;
  name: string;
  city?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-my-reviews',
  template: `
    <div class="container">
      <!-- Write a Review Section -->
      <div class="card" *ngIf="eligibleHotels.length > 0 || showWriteReview">
        <h2 class="card-title">✍️ Write a Review</h2>
        
        <div *ngIf="!showWriteReview && eligibleHotels.length > 0" class="eligible-hotels">
          <p style="color: #666; margin-bottom: 15px;">
            You can write reviews for hotels where you have completed your stay:
          </p>
          <div class="hotel-cards">
            <div *ngFor="let hotel of eligibleHotels" class="hotel-card" (click)="startReview(hotel)">
              <div class="hotel-image">
                <img [src]="hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'" [alt]="hotel.name">
              </div>
              <div class="hotel-info">
                <h4>{{hotel.name}}</h4>
                <p>{{hotel.city || 'Location not available'}}</p>
                <button class="btn btn-primary" style="margin-top: 10px;">Write Review</button>
              </div>
            </div>
          </div>
        </div>
        
        <div *ngIf="showWriteReview" class="write-review-form">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3>Review for: {{selectedHotel?.name}}</h3>
            <button class="btn btn-secondary" (click)="cancelReview()">Cancel</button>
          </div>
          
          <div class="form-group">
            <label>Rating *</label>
            <div class="star-rating">
              <span *ngFor="let star of [1,2,3,4,5]" 
                    (click)="newReview.rating = star"
                    [class.selected]="star <= newReview.rating"
                    style="cursor: pointer; font-size: 32px;">
                {{star <= newReview.rating ? '⭐' : '☆'}}
              </span>
            </div>
          </div>
          
          <div class="form-group">
            <label>Review Title *</label>
            <input type="text" [(ngModel)]="newReview.title" placeholder="Summarize your experience">
          </div>
          
          <div class="form-group">
            <label>Your Review *</label>
            <textarea [(ngModel)]="newReview.comment" rows="5" 
                      placeholder="Share your experience with other travelers..."></textarea>
          </div>
          
          <button class="btn btn-primary" (click)="submitReview()" 
                  [disabled]="!newReview.rating || !newReview.title || !newReview.comment">
            Submit Review
          </button>
        </div>
        
        <div *ngIf="!showWriteReview && eligibleHotels.length === 0" class="no-eligible">
          <p style="color: #666;">
            📅 Complete a stay at any hotel to leave a review. Reviews help other travelers make informed decisions!
          </p>
        </div>
      </div>
      
      <!-- My Reviews List -->
      <div class="card">
        <h2 class="card-title">📝 My Reviews</h2>
        
        <div *ngIf="myReviews.length > 0; else noReviews" class="reviews-list">
          <div *ngFor="let review of myReviews" class="review-card">
            <div class="review-header">
              <div>
                <h4>{{getHotelName(review.hotelId)}}</h4>
                <span class="review-date">{{review.createdAt | date:'mediumDate'}}</span>
              </div>
              <span *ngIf="review.verified" class="verified-badge">✓ Verified Stay</span>
            </div>
            
            <div class="review-rating">
              {{getStars(review.rating)}}
            </div>
            
            <h5 class="review-title">{{review.title}}</h5>
            <p class="review-comment">{{review.comment}}</p>
            
            <div *ngIf="review.adminReply" class="admin-reply">
              <strong>🏨 Hotel Response:</strong>
              <p>{{review.adminReply}}</p>
              <div *ngIf="review.userReply" class="user-reply">
                <strong>Your Reply:</strong>
                <p>{{review.userReply}}</p>
              </div>
            </div>
            
            <div class="review-actions">
              <button class="btn btn-secondary" style="padding: 4px 10px;"
                      (click)="editReview(review)">✏️ Edit</button>
              <button class="btn btn-danger" style="padding: 4px 10px;"
                      (click)="deleteReview(review)">🗑 Delete</button>
              <button *ngIf="review.adminReply && !review.userReply" 
                      class="btn btn-primary" style="padding: 4px 10px;"
                      (click)="replyToHotel(review)">💬 Reply to Hotel</button>
            </div>
          </div>
        </div>
        
        <ng-template #noReviews>
          <div class="empty-state">
            <div style="font-size: 48px; margin-bottom: 15px;">📝</div>
            <h3>No Reviews Yet</h3>
            <p>After completing a stay, you can share your experience here.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .eligible-hotels {
      padding: 10px 0;
    }
    
    .hotel-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    
    .hotel-card {
      background: #f9f9f9;
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .hotel-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    }
    
    .hotel-image img {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }
    
    .hotel-info {
      padding: 15px;
    }
    
    .hotel-info h4 {
      margin: 0 0 5px 0;
      color: #2c3e50;
    }
    
    .hotel-info p {
      margin: 0;
      color: #7f8c8d;
      font-size: 14px;
    }
    
    .write-review-form {
      padding: 20px;
      background: #f9f9f9;
      border-radius: 10px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #2c3e50;
    }
    
    .form-group input, .form-group textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }
    
    .star-rating span.selected {
      color: #f39c12;
    }
    
    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .review-card {
      background: #f9f9f9;
      border-radius: 10px;
      padding: 20px;
      border-left: 4px solid #3498db;
    }
    
    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }
    
    .review-header h4 {
      margin: 0;
      color: #2c3e50;
    }
    
    .review-date {
      font-size: 12px;
      color: #7f8c8d;
    }
    
    .verified-badge {
      background: #28a745;
      color: white;
      padding: 4px 10px;
      border-radius: 15px;
      font-size: 11px;
      font-weight: bold;
    }
    
    .review-rating {
      margin-bottom: 10px;
    }
    
    .review-title {
      margin: 0 0 10px 0;
      color: #2c3e50;
    }
    
    .review-comment {
      color: #555;
      line-height: 1.6;
      margin-bottom: 15px;
    }
    
    .admin-reply {
      background: #e8f4fd;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 15px;
    }
    
    .admin-reply strong {
      color: #2980b9;
    }
    
    .admin-reply p {
      margin: 10px 0 0 0;
      color: #555;
    }
    
    .user-reply {
      background: #f0f8ff;
      padding: 10px;
      border-radius: 5px;
      margin-top: 10px;
      border-left: 3px solid #2196f3;
    }
    
    .user-reply strong {
      color: #1565c0;
    }
    
    .user-reply p {
      margin: 5px 0 0 0;
      color: #555;
    }
    
    .review-actions {
      display: flex;
      gap: 10px;
    }
    
    .no-eligible {
      padding: 20px;
      background: #f9f9f9;
      border-radius: 10px;
      text-align: center;
    }
    
    .empty-state {
      text-align: center;
      padding: 40px 20px;
    }
    
    .empty-state h3 {
      color: #2c3e50;
      margin-bottom: 10px;
    }
    
    .empty-state p {
      color: #7f8c8d;
    }
  `]
})
export class MyReviewsComponent implements OnInit {
  myReviews: Review[] = [];
  eligibleHotels: Hotel[] = [];
  hotels: Map<string, Hotel> = new Map();
  showWriteReview = false;
  selectedHotel: Hotel | null = null;
  
  newReview = {
    rating: 0,
    title: '',
    comment: ''
  };
  
  constructor(
    private reviewService: ReviewsService,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}
  
  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadHotels();
  }
  
  loadHotels() {
    this.http.get<Hotel[]>('/api/hotels').subscribe({
      next: (hotels) => {
        hotels.forEach(h => this.hotels.set(h.id, h));
        this.loadEligibleHotels();
        this.loadMyReviews();
      },
      error: (err) => console.error('Failed to load hotels:', err)
    });
  }
  
  loadEligibleHotels() {
    const userId = this.authService.getUserId();
    if (!userId) return;
    
    this.http.get<string[]>(`/api/reviews/user/${userId}/eligible-hotels`).subscribe({
      next: (hotelIds) => {
        this.eligibleHotels = hotelIds
          .map(id => this.hotels.get(id))
          .filter((h): h is Hotel => h !== undefined);
      },
      error: (err) => console.error('Failed to load eligible hotels:', err)
    });
  }
  
  loadMyReviews() {
    const userId = this.authService.getUserId();
    if (!userId) return;
    
    this.reviewService.getUserReviews(userId).subscribe({
      next: (reviews) => this.myReviews = reviews,
      error: (err) => console.error('Failed to load reviews:', err)
    });
  }
  
  getHotelName(hotelId: string): string {
    return this.hotels.get(hotelId)?.name || hotelId;
  }
  
  getStars(rating: number): string {
    return '⭐'.repeat(rating);
  }
  
  startReview(hotel: Hotel) {
    this.selectedHotel = hotel;
    this.showWriteReview = true;
    this.newReview = { rating: 0, title: '', comment: '' };
  }
  
  cancelReview() {
    this.showWriteReview = false;
    this.selectedHotel = null;
    this.newReview = { rating: 0, title: '', comment: '' };
  }
  
  submitReview() {
    if (!this.selectedHotel || !this.newReview.rating || !this.newReview.title || !this.newReview.comment) {
      alert('Please fill in all fields');
      return;
    }
    
    const userId = this.authService.getUserId();
    if (!userId) return;
    
    const review = {
      userId: userId,
      hotelId: this.selectedHotel.id,
      rating: this.newReview.rating,
      title: this.newReview.title,
      comment: this.newReview.comment
    };
    
    this.reviewService.createReview(review).subscribe({
      next: () => {
        alert('Review submitted successfully! It will be visible after admin approval.');
        this.cancelReview();
        this.loadMyReviews();
        this.loadEligibleHotels();
      },
      error: (err) => alert('Failed to submit review: ' + (err.error?.error || err.message))
    });
  }
  
  editReview(review: Review) {
    // For now, just allow editing title and comment
    const newTitle = prompt('Edit review title:', review.title);
    if (newTitle === null) return;
    
    const newComment = prompt('Edit your review:', review.comment);
    if (newComment === null) return;
    
    this.http.put(`/api/reviews/${review.id}`, {
      ...review,
      title: newTitle,
      comment: newComment
    }).subscribe({
      next: () => {
        alert('Review updated successfully!');
        this.loadMyReviews();
      },
      error: (err: any) => alert('Failed to update review: ' + (err.error?.error || err.message))
    });
  }
  
  deleteReview(review: Review) {
    if (!review.id) return;
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    this.reviewService.deleteReview(review.id).subscribe({
      next: () => {
        alert('Review deleted successfully!');
        this.loadMyReviews();
        this.loadEligibleHotels();
      },
      error: (err) => alert('Failed to delete review: ' + err.message)
    });
  }
  
  replyToHotel(review: Review) {
    const userReply = prompt('Reply to hotel\'s response:', '');
    if (!userReply || !userReply.trim()) return;
    
    this.reviewService.addUserReply(review.id!, userReply).subscribe({
      next: () => {
        alert('Reply posted successfully!');
        this.loadMyReviews();
      },
      error: (err) => alert('Failed to post reply: ' + (err.error?.message || err.message))
    });
  }
}
