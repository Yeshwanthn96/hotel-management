import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id?: string;
  userId: string;
  hotelId: string;
  bookingId?: string;
  rating: number;
  title: string;
  comment: string;
  status?: string;
  createdAt?: string;
  verified?: boolean;
  adminReply?: string;
  adminReplyAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private base = '/api/reviews';
  
  constructor(private http: HttpClient) {}
  
  createReview(review: Review): Observable<Review> {
    return this.http.post<Review>(this.base, review);
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
  
  approveReview(id: string): Observable<Review> {
    return this.http.put<Review>(`${this.base}/${id}/approve`, {});
  }
  
  rejectReview(id: string): Observable<Review> {
    return this.http.put<Review>(`${this.base}/${id}/reject`, {});
  }
}
