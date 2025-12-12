import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Room {
  id: string;
  hotelId: string;
  roomNumber: string;
  roomType: string;
  description: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  availabilityCalendar: { [key: string]: boolean };
  active: boolean;
  imageUrl?: string;
}

export interface RoomSearchParams {
  capacity?: number;
  checkIn?: string;
  checkOut?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = '/api/rooms';

  constructor(private http: HttpClient) {}

  getRoomById(id: string): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }

  getAvailableRoomsByHotel(hotelId: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/hotel/${hotelId}/available`);
  }

  searchRoomsByHotel(hotelId: string, params: RoomSearchParams): Observable<Room[]> {
    let httpParams = new HttpParams();
    
    if (params.capacity !== undefined) {
      httpParams = httpParams.set('capacity', params.capacity.toString());
    }
    if (params.checkIn) {
      httpParams = httpParams.set('checkIn', params.checkIn);
    }
    if (params.checkOut) {
      httpParams = httpParams.set('checkOut', params.checkOut);
    }

    return this.http.get<Room[]>(`${this.apiUrl}/hotel/${hotelId}/search`, { params: httpParams });
  }

  createRoom(room: Room): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, room);
  }

  updateRoom(id: string, room: Room): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}`, room);
  }

  deleteRoom(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateRoomAvailability(id: string, date: string, available: boolean): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}/availability`, { date, available });
  }

  activateRoom(id: string): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivateRoom(id: string): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}/deactivate`, {});
  }
}
