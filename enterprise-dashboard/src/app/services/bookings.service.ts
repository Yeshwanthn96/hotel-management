import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Booking {
  id?: string;
  userId: string;
  hotelId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalAmount?: number;
  status?: string;
  paymentId?: string;
  createdAt?: string;
  expiresAt?: string;
  message?: string;
}

export interface BookingRequest {
  userId: string;
  hotelId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  paymentMethod: string; // STRIPE, PAYPAL, MOCK
}

@Injectable({ providedIn: 'root' })
export class BookingsService {
  private base = '/api/bookings';
  
  constructor(private http: HttpClient) {}
  
  createBooking(request: BookingRequest): Observable<Booking> {
    return this.http.post<Booking>(this.base, request);
  }
  
  confirmBooking(bookingId: string, paymentId: string): Observable<Booking> {
    return this.http.put<Booking>(`${this.base}/${bookingId}/confirm`, { paymentId });
  }
  
  cancelBooking(bookingId: string, reason: string): Observable<Booking> {
    return this.http.put<Booking>(`${this.base}/${bookingId}/cancel`, { reason });
  }
  
  getBooking(bookingId: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.base}/${bookingId}`);
  }
  
  getUserBookings(userId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.base}/user/${userId}`);
  }
  
  getHotelBookings(hotelId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.base}/hotel/${hotelId}`);
  }
  
  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.base);
  }
}
