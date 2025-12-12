import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  passwordErrors: string[] = [];
  passwordStrength = { strength: 'Weak', percentage: 0, color: '#ef4444' };
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onPasswordChange() {
    const validation = this.authService.validatePassword(this.password);
    this.passwordErrors = validation.errors;
    this.passwordStrength = this.authService.getPasswordStrength(this.password);
  }

  register() {
    this.errorMessage = '';
    this.successMessage = '';

    // Validation
    if (!this.firstName || !this.lastName || !this.email || !this.phone || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (!this.authService.validateEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    const validation = this.authService.validatePassword(this.password);
    if (!validation.valid) {
      this.errorMessage = 'Password does not meet requirements';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;

    const registerData = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      password: this.password
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Registration successful! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Registration failed. Please try again.';
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  close() {
    this.router.navigate(['/auth/login']);
  }
}
