import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentsService } from '../payments.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-user-payments',
  templateUrl: './user-payments.component.html',
  styleUrls: ['./user-payments.component.css']
})
export class UserPaymentsComponent implements OnInit {
  payments: any[] = [];
  isLoading = true;
  errorMessage = '';
  currentUser: any;

  constructor(
    private paymentsService: PaymentsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadUserPayments();
    }
  }

  loadUserPayments() {
    this.isLoading = true;
    // Load only payments for the current user
    this.paymentsService.getUserPayments(this.currentUser.id).subscribe({
      next: (data) => {
        this.payments = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load your payment history';
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const statusMap: any = {
      'SUCCESS': 'status-success',
      'PENDING': 'status-pending',
      'FAILED': 'status-failed',
      'REFUNDED': 'status-refunded'
    };
    return statusMap[status] || 'status-pending';
  }

  downloadReceipt(paymentId: string) {
    alert('Receipt download functionality to be implemented');
  }
}
