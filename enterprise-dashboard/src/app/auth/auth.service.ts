import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from './models/login-request';
import { JwtResponse } from './models/jwt-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  private currentUser: any = null;
  
  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }
  
  login(credentials: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            // Store user info from backend response
            this.currentUser = {
              id: response.userId,
              email: response.email,
              role: response.role,
              firstName: response.firstName,
              lastName: response.lastName
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          }
        })
      );
  }

  register(registerData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, registerData);
  }

  logout(): void {
    localStorage.clear(); // Clear all localStorage
    sessionStorage.clear(); // Clear sessionStorage too
    this.currentUser = null;
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): any {
    return this.currentUser;
  }

  getUserId(): string | null {
    return this.currentUser?.id || null;
  }

  getUserRole(): string {
    return this.currentUser?.role || 'guest';
  }

  hasRole(roles: string[]): boolean {
    const userRole = this.getUserRole().toUpperCase();
    const normalizedRoles = roles.map(r => r.toUpperCase());
    return normalizedRoles.includes(userRole);
  }

  // Check specific permissions
  canAdd(): boolean {
    return this.hasRole(['admin', 'manager']);
  }

  canEdit(): boolean {
    return this.hasRole(['admin', 'manager']);
  }

  canDelete(): boolean {
    return this.hasRole(['admin']);
  }

  canView(): boolean {
    return this.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.hasRole(['ADMIN', 'admin']);
  }

  isUser(): boolean {
    return this.hasRole(['USER', 'user']);
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(email: string, resetToken: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { email, resetToken, newPassword });
  }

  changePassword(email: string, oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, { email, oldPassword, newPassword });
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[A-Za-z0-9+_.-]+@(.+)$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Must contain at least one special character');
    }
    
    return { valid: errors.length === 0, errors };
  }

  getPasswordStrength(password: string): { strength: string; percentage: number; color: string } {
    let strength = 0;
    
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;
    
    let label = 'Weak';
    let color = '#ef4444';
    
    if (strength >= 80) {
      label = 'Strong';
      color = '#10b981';
    } else if (strength >= 50) {
      label = 'Medium';
      color = '#f59e0b';
    }
    
    return { strength: label, percentage: strength, color };
  }
}