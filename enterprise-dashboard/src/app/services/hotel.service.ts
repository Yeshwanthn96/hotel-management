import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  starRating: number;
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  active: boolean;
  imageUrl?: string;
}

export interface HotelSearchRequest {
  city?: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  amenities?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private apiUrl = '/api/hotels';

  constructor(private http: HttpClient) {}

  getAllHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(this.apiUrl);
  }

  getActiveHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.apiUrl}/active`);
  }

  getHotelById(id: string): Observable<Hotel> {
    return this.http.get<Hotel>(`${this.apiUrl}/${id}`);
  }

  searchHotels(searchRequest: HotelSearchRequest): Observable<Hotel[]> {
    return this.http.post<Hotel[]>(`${this.apiUrl}/search`, searchRequest);
  }

  createHotel(hotel: Hotel): Observable<Hotel> {
    return this.http.post<Hotel>(this.apiUrl, hotel);
  }

  updateHotel(id: string, hotel: Hotel): Observable<Hotel> {
    return this.http.put<Hotel>(`${this.apiUrl}/${id}`, hotel);
  }

  deleteHotel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  activateHotel(id: string): Observable<Hotel> {
    return this.http.put<Hotel>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivateHotel(id: string): Observable<Hotel> {
    return this.http.put<Hotel>(`${this.apiUrl}/${id}/deactivate`, {});
  }
}
