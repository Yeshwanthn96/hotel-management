import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private apiUrl = '/api/payments';

  constructor(private http: HttpClient) {}

  // User-specific payments
  getUserPayments(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Admin: Get all payments
  getAllPayments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getPaymentById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createPayment(payment: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payment);
  }

  processRefund(paymentId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${paymentId}/refund`, {});
  }
}
