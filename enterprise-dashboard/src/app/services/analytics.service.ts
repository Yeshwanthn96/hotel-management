import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageBookingAmount: number;
  averageOccupancy: number;
  revenueByHotel: { [key: string]: number };
  occupancyRates: { [key: string]: number };
  topRatedHotels: Array<{ key: string; value: number }>;
  topRevenueHotels: Array<{ key: string; value: number }>;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private base = '/api/analytics';
  
  constructor(private http: HttpClient) {}
  
  getDashboardStatistics(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.base}/dashboard`);
  }
  
  getTotalRevenue(): Observable<number> {
    return this.http.get<number>(`${this.base}/revenue/total`);
  }
  
  getRevenueByHotel(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.base}/revenue/by-hotel`);
  }
  
  getMonthlyRevenue(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.base}/revenue/monthly`);
  }
  
  getOccupancyRates(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.base}/occupancy`);
  }
  
  getTopRatedHotels(limit: number = 10): Observable<Array<{ key: string; value: number }>> {
    return this.http.get<Array<{ key: string; value: number }>>(`${this.base}/top-rated?limit=${limit}`);
  }
  
  getHotelsByRevenue(limit: number = 10): Observable<Array<{ key: string; value: number }>> {
    return this.http.get<Array<{ key: string; value: number }>>(`${this.base}/hotels/by-revenue?limit=${limit}`);
  }
  
  getBookingsByStatus(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.base}/bookings/by-status`);
  }
  
  getAverageBookingAmount(): Observable<number> {
    return this.http.get<number>(`${this.base}/bookings/average-amount`);
  }
}

