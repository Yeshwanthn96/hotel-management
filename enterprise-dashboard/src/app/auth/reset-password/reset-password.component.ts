import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  email = '';
  resetToken = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  passwordErrors: string[] = [];
  passwordStrength = { strength: 'Weak', percentage: 0, color: '#ef4444' };
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.resetToken = params['token'] || '';
    });
  }

  onPasswordChange() {
    const validation = this.authService.validatePassword(this.newPassword);
    this.passwordErrors = validation.errors;
    this.passwordStrength = this.authService.getPasswordStrength(this.newPassword);
  }

  resetPassword() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.resetToken) {
      this.errorMessage = 'Invalid reset link. Please request a new password reset.';
      return;
    }

    if (!this.newPassword) {
      this.errorMessage = 'Please enter a new password';
      return;
    }

    const validation = this.authService.validatePassword(this.newPassword);
    if (!validation.valid) {
      this.errorMessage = 'Password does not meet requirements';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;

    this.authService.resetPassword(this.email, this.resetToken, this.newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Password reset successful! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Failed to reset password. Token may be expired or invalid.';
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  close() {
    this.router.navigate(['/auth/login']);
  }
}
