import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentsService, PaymentRequest } from '../../services/payments.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-payments-add',
  templateUrl: './payments-add.component.html'
})
export class PaymentsAddComponent {
  payment: PaymentRequest = {
    bookingId: '',
    userId: '',
    amount: 0,
    paymentMethod: 'STRIPE'
  };

  cardDetails = {
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: ''
  };

  isProcessing = false;
  showPaymentModal = false;
  paymentSuccess = false;
  paymentError = '';
  transactionId = '';
  
  constructor(
    private svc: PaymentsService,
    private router: Router,
    private authService: AuthService
  ) {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.payment.userId = currentUser.id;
    }
  }
  
  isFormValid(): boolean {
    const hasBasicInfo = this.payment.bookingId.trim() !== '' && this.payment.amount > 0;
    
    if (!hasBasicInfo) return false;

    if (this.payment.paymentMethod === 'STRIPE') {
      return this.cardDetails.cardNumber.replace(/\s/g, '').length >= 15 &&
             this.cardDetails.expiryDate.length >= 5 &&
             this.cardDetails.cvc.length >= 3 &&
             this.cardDetails.cardholderName.trim() !== '';
    }

    return true;
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    this.cardDetails.cardNumber = formattedValue;
  }

  formatExpiryDate(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + ' / ' + value.substring(2, 4);
    }
    this.cardDetails.expiryDate = value;
  }

  formatCVC(event: any) {
    this.cardDetails.cvc = event.target.value.replace(/\D/g, '').substring(0, 4);
  }
  
  async save() {
    if (!this.isFormValid()) {
      alert('Please fill in all required fields correctly');
      return;
    }

    this.isProcessing = true;
    this.showPaymentModal = true;
    this.paymentError = '';
    this.paymentSuccess = false;

    try {
      // Simulate payment gateway processing
      await this.simulatePaymentGateway();

      // Process actual payment
      const result = await this.svc.processPayment(this.payment).toPromise();
      
      this.paymentSuccess = true;
      this.transactionId = result?.transactionId || 'TXN-' + Date.now();
      
      // Redirect after 2 seconds
      setTimeout(() => {
        this.router.navigate(['/payments']);
      }, 2000);

    } catch (err: any) {
      this.paymentError = err.error?.message || err.message || 'Payment processing failed. Please try again.';
      this.paymentSuccess = false;
    } finally {
      this.isProcessing = false;
    }
  }

  private simulatePaymentGateway(): Promise<void> {
    return new Promise((resolve, reject) => {
      const delay = this.payment.paymentMethod === 'STRIPE' ? 2000 : 
                    this.payment.paymentMethod === 'PAYPAL' ? 1500 : 1000;
      
      setTimeout(() => {
        // 95% success rate simulation
        if (Math.random() > 0.05) {
          resolve();
        } else {
          reject(new Error('Payment declined by gateway'));
        }
      }, delay);
    });
  }

  closeModal() {
    if (!this.isProcessing) {
      this.showPaymentModal = false;
      if (this.paymentSuccess) {
        this.router.navigate(['/payments']);
      }
    }
  }

  retryPayment() {
    this.showPaymentModal = false;
    this.paymentError = '';
  }
}
