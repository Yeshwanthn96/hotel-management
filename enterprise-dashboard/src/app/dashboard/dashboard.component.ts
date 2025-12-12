import { Component, OnInit } from '@angular/core';
import { AnalyticsService, DashboardStats } from '../services/analytics.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading = true;
    this.analyticsService.getDashboardStatistics().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard:', err);
        this.loading = false;
      }
    });
  }

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  formatPercent(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
  }
}
