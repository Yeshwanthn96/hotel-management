import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id?: string;
  userId: string;
  userName?: string;
  hotelId: string;
  hotelName?: string;
  bookingId?: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
  verified?: boolean;
  adminReply?: string;
  userReply?: string;
  helpfulCount?: number;
  reported?: boolean;
  reportCount?: number;
}

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private base = '/api/reviews';
  
  constructor(private http: HttpClient) {}
  
  createReview(review: Review): Observable<Review> {
    return this.http.post<Review>(this.base, review);
  }

  updateReview(id: string, review: Partial<Review>): Observable<Review> {
    return this.http.put<Review>(`${this.base}/${id}`, review);
  }
  
  getReview(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.base}/${id}`);
  }
  
  getHotelReviews(hotelId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.base}/hotel/${hotelId}`);
  }
  
  getUserReviews(userId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.base}/user/${userId}`);
  }
  
  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.base);
  }
  
  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
  
  getAverageRating(hotelId: string): Observable<number> {
    return this.http.get<number>(`${this.base}/hotel/${hotelId}/average`);
  }
  
  getEligibleHotelsForReview(userId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/user/${userId}/eligible-hotels`);
  }
  
  addAdminReply(reviewId: string, reply: string): Observable<Review> {
    return this.http.post<Review>(`${this.base}/${reviewId}/reply`, { reply });
  }
  
  addUserReply(reviewId: string, userReply: string): Observable<Review> {
    return this.http.post<Review>(`${this.base}/${reviewId}/user-reply`, { userReply });
  }
}
