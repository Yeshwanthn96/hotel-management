import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  
  constructor(private authService: AuthService, private router: Router) {
    // Automatically logout any existing session when accessing login page
    this.authService.logout();
  }
  
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
          // Navigate based on role (case-insensitive) and force reload to update UI
          const targetUrl = (response.role && response.role.toUpperCase() === 'ADMIN') ? '/admin/dashboard' : '/hotels';
          this.router.navigate([targetUrl]).then(() => {
            window.location.reload(); // Force reload to refresh all components with new user state
          });
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

  close() {
    // Optional: navigate away or show a message
  }
}