import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private apiUrl = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) {}

  // User-specific bookings
  getUserBookings(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Admin: Get all bookings
  getAllBookings(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getBookingById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createBooking(booking: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, booking);
  }

  updateBooking(id: string, booking: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, booking);
  }

  cancelBooking(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/cancel`, {});
  }

  deleteBooking(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
