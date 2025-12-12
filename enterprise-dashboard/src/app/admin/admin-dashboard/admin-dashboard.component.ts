import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats = [
    { title: 'Total Hotels', value: '0', icon: '🏨', color: '#667eea', route: '/admin/hotels' },
    { title: 'Active Bookings', value: '0', icon: '📅', color: '#10b981', route: '/bookings' },
    { title: 'Total Users', value: '0', icon: '👥', color: '#f59e0b', route: '/admin/users' },
    { title: 'Total Revenue', value: '$0', icon: '💰', color: '#ef4444', route: '/payments' },
    { title: 'Services', value: '0', icon: '🛎️', color: '#8b5cf6', route: '/admin/services' },
    { title: 'Reviews', value: '0', icon: '⭐', color: '#f97316', route: '/reviews' }
  ];

  recentActivities = [
    { icon: '🏨', text: 'New hotel added: Grand Plaza Hotel', time: '2 hours ago', type: 'success' },
    { icon: '📅', text: 'New booking confirmed', time: '3 hours ago', type: 'info' },
    { icon: '👤', text: 'New user registered', time: '5 hours ago', type: 'default' },
    { icon: '⭐', text: 'New review received', time: '6 hours ago', type: 'warning' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // TODO: Load actual stats from services
    this.loadStats();
  }

  loadStats() {
    // Placeholder - will be replaced with actual API calls
    setTimeout(() => {
      this.stats[0].value = '12';
      this.stats[1].value = '45';
      this.stats[2].value = '234';
      this.stats[3].value = '$45,890';
      this.stats[4].value = '8';
      this.stats[5].value = '156';
    }, 500);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
