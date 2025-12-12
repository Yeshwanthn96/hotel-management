import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Payment {
  id?: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency?: string;
  paymentMethod: string; // STRIPE, PAYPAL, MOCK
  status?: string;
  transactionId?: string;
  refundId?: string;
  refundedAmount?: number;
  createdAt?: string;
  failureReason?: string;
}

export interface PaymentRequest {
  bookingId: string;
  userId: string;
  amount: number;
  paymentMethod: string;
}

export interface RefundRequest {
  amount: number;
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private base = '/api/payments';
  
  constructor(private http: HttpClient) {}
  
  processPayment(request: PaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(this.base, request);
  }
  
  refundPayment(paymentId: string, refund: RefundRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.base}/${paymentId}/refund`, refund);
  }
  
  getPayment(paymentId: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.base}/${paymentId}`);
  }
  
  getPaymentByBooking(bookingId: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.base}/booking/${bookingId}`);
  }
  
  getUserPayments(userId: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.base}/user/${userId}`);
  }
  
  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.base);
  }
}
