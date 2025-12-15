import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentsService } from '../payments.service';

@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.css']
})
export class PaymentDetailsComponent implements OnInit {
  payment: any = null;
  isLoading = true;
  errorMessage = '';
  paymentId: string = '';

  constructor(
    private paymentsService: PaymentsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.paymentId = this.route.snapshot.paramMap.get('id') || '';
    if (this.paymentId) {
      this.loadPaymentDetails();
    }
  }

  loadPaymentDetails() {
    this.isLoading = true;
    this.paymentsService.getPaymentById(this.paymentId).subscribe({
      next: (data) => {
        this.payment = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load payment details';
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const statusMap: any = {
      'SUCCESS': 'status-success',
      'COMPLETED': 'status-success',
      'PENDING': 'status-pending',
      'FAILED': 'status-failed',
      'REFUNDED': 'status-refunded'
    };
    return statusMap[status] || 'status-pending';
  }

  goBack() {
    this.router.navigate(['/payments']);
  }

  downloadReceipt() {
    alert('Receipt download functionality to be implemented');
  }
}
