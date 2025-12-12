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
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
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