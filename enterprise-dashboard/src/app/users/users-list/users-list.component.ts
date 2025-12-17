import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { HttpClient } from '@angular/common/http';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  regularUsers: number;
}

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html'
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  stats: UserStats | null = null;
  searchTerm = '';
  statusFilter = 'ALL';
  roleFilter = 'ALL';
  
  // Add User Modal
  showAddModal = false;
  isLoading = false;
  newUser = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'USER'
  };
  
  constructor(
    private svc: UsersService,
    private http: HttpClient
  ) {}
  
  ngOnInit() { 
    this.loadStats();
    this.loadUsers(); 
  }
  
  loadStats() {
    this.http.get<UserStats>('/api/users/stats').subscribe({
      next: (stats) => this.stats = stats,
      error: (err) => console.error('Failed to load stats:', err)
    });
  }
  
  loadUsers() { 
    this.svc.list().subscribe({
      next: (users: any[]) => {
        this.users = users;
        this.applyFilters();
      },
      error: (err) => console.error('Failed to load users:', err)
    }); 
  }
  
  applyFilters() {
    let filtered = [...this.users];
    
    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.firstName?.toLowerCase().includes(term) ||
        u.lastName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
      );
    }
    
    // Status filter
    if (this.statusFilter !== 'ALL') {
      const isActive = this.statusFilter === 'ACTIVE';
      filtered = filtered.filter(u => u.active === isActive);
    }
    
    // Role filter
    if (this.roleFilter !== 'ALL') {
      filtered = filtered.filter(u => u.role?.toUpperCase() === this.roleFilter);
    }
    
    this.filteredUsers = filtered;
  }
  
  // Add User Modal Methods
  openAddModal() {
    this.resetNewUser();
    this.showAddModal = true;
  }
  
  closeAddModal() {
    this.showAddModal = false;
    this.resetNewUser();
  }
  
  resetNewUser() {
    this.newUser = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'USER'
    };
  }
  
  addUser() {
    // Validation
    if (!this.newUser.firstName || !this.newUser.lastName || !this.newUser.email || !this.newUser.password) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (this.newUser.password !== this.newUser.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (this.newUser.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    this.isLoading = true;
    
    // Use the register endpoint but admin can set the role
    const userData = {
      firstName: this.newUser.firstName,
      lastName: this.newUser.lastName,
      email: this.newUser.email,
      phone: this.newUser.phone,
      password: this.newUser.password,
      role: this.newUser.role
    };
    
    this.http.post('/api/auth/register', userData).subscribe({
      next: () => {
        this.isLoading = false;
        alert('User created successfully!');
        this.closeAddModal();
        this.loadUsers();
        this.loadStats();
      },
      error: (err) => {
        this.isLoading = false;
        alert('Failed to create user: ' + (err.error?.error || err.message));
      }
    });
  }
  
  toggleUserStatus(user: User) {
    const newStatus = !user.active;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (!confirm(`Are you sure you want to ${action} user ${user.email}?`)) return;
    
    this.http.put<any>(`/api/users/${user.id}/status`, { active: newStatus }).subscribe({
      next: () => {
        alert(`User ${action}d successfully`);
        this.loadUsers();
        this.loadStats();
      },
      error: (err) => alert(`Failed to ${action} user: ${err.error?.error || err.message}`)
    });
  }
  
  changeRole(user: User) {
    const newRole = user.role?.toUpperCase() === 'ADMIN' ? 'USER' : 'ADMIN';
    
    if (!confirm(`Change ${user.email}'s role to ${newRole}?`)) return;
    
    this.http.put<any>(`/api/users/${user.id}/role`, { role: newRole }).subscribe({
      next: () => {
        alert(`User role changed to ${newRole}`);
        this.loadUsers();
        this.loadStats();
      },
      error: (err) => alert(`Failed to change role: ${err.error?.error || err.message}`)
    });
  }
  
  deleteUser(user: User) {
    if (!confirm(`Are you sure you want to permanently delete user ${user.email}? This action cannot be undone.`)) return;
    
    this.svc.delete(user.id).subscribe({
      next: () => {
        alert('User deleted successfully');
        this.loadUsers();
        this.loadStats();
      },
      error: (err: any) => alert(`Failed to delete user: ${err.error?.error || err.message}`)
    });
  }
  
  getRoleBadgeClass(role: string): string {
    return role?.toUpperCase() === 'ADMIN' ? 'badge-warning' : 'badge-info';
  }
  
  getStatusBadgeClass(active: boolean): string {
    return active ? 'badge-success' : 'badge-danger';
  }
}
