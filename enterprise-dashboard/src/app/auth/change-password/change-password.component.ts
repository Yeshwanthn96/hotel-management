import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  passwordErrors: string[] = [];
  passwordStrength = { strength: 'Weak', percentage: 0, color: '#ef4444' };
  showOldPassword = false;
  showNewPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onPasswordChange() {
    const validation = this.authService.validatePassword(this.newPassword);
    this.passwordErrors = validation.errors;
    this.passwordStrength = this.authService.getPasswordStrength(this.newPassword);
  }

  changePassword() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    const validation = this.authService.validatePassword(this.newPassword);
    if (!validation.valid) {
      this.errorMessage = 'New password does not meet requirements';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.oldPassword === this.newPassword) {
      this.errorMessage = 'New password must be different from old password';
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user || !user.email) {
      this.errorMessage = 'User not authenticated';
      return;
    }

    this.isLoading = true;

    this.authService.changePassword(user.email, this.oldPassword, this.newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Password changed successfully!';
        setTimeout(() => {
          this.close();
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Failed to change password. Please try again.';
      }
    });
  }

  toggleOldPasswordVisibility() {
    this.showOldPassword = !this.showOldPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  close() {
    this.router.navigate(['/dashboard']);
  }
}
