import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  resetToken = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  forgotPassword() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email) {
      this.errorMessage = 'Please enter your email address';
      return;
    }

    if (!this.authService.validateEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Password reset instructions sent to your email. You will be redirected...';
        this.resetToken = response.resetToken; // For demo purposes
        setTimeout(() => {
          this.router.navigate(['/auth/reset-password'], { 
            queryParams: { email: this.email, token: this.resetToken } 
          });
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Failed to send reset email. Please try again.';
      }
    });
  }

  close() {
    this.router.navigate(['/auth/login']);
  }
}
