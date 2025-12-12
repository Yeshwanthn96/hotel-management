import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  
  constructor(private authService: AuthService, private router: Router) {}
  
  login() {
    this.errorMessage = '';

    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    if (!this.authService.validateEmail(this.username)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;

    this.authService.login({ username: this.username, password: this.password })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          // Check if user has admin role
          if (response.role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.errorMessage = 'Access denied. Admin credentials required.';
            this.authService.logout();
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.error || 'Invalid credentials. Please try again.';
        }
      });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
