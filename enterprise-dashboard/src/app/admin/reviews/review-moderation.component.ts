import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-review-moderation',
  templateUrl: './review-moderation.component.html',
  styleUrls: ['./review-moderation.component.css']
})
export class ReviewModerationComponent implements OnInit {
  reviews: any[] = [];
  filteredReviews: any[] = [];
  selectedReview: any = null;
  showDetailModal = false;
  loading = false;
  error = '';
  successMessage = '';

  adminReply = '';
  rejectionReason = '';

  statusFilter = 'PENDING_APPROVAL';
  ratingFilter = 0;

  hotels: Map<string, any> = new Map();
  users: Map<string, any> = new Map();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadHotelsAndUsers();
    this.loadReviews();
  }

  loadHotelsAndUsers(): void {
    // Load hotels
    this.http.get<any[]>('/api/hotels').subscribe({
      next: (hotels) => hotels.forEach(h => this.hotels.set(h.id, h)),
      error: (err) => console.error('Failed to load hotels:', err)
    });
    
    // Load users
    this.http.get<any>('/api/users/all').subscribe({
      next: (response) => {
        const userList = response.users || response || [];
        userList.forEach((u: any) => this.users.set(u.id, u));
      },
      error: (err) => console.error('Failed to load users:', err)
    });
  }

  loadReviews(): void {
    this.loading = true;
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const url = this.statusFilter === 'PENDING_APPROVAL' 
      ? '/api/reviews/admin/pending'
      : '/api/reviews/admin/all';

    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Role': user.role || ''
      }
    })
      .then(res => res.json())
      .then(data => {
        // Enrich reviews with hotel and user names
        this.reviews = data.map((review: any) => {
          const hotel = this.hotels.get(review.hotelId);
          const reviewUser = this.users.get(review.userId);
          return {
            ...review,
            hotelName: hotel ? hotel.name : review.hotelId,
            userName: reviewUser ? `${reviewUser.firstName} ${reviewUser.lastName}` : review.userId,
            userEmail: reviewUser ? reviewUser.email : ''
          };
        });
        this.applyFilters();
        this.loading = false;
      })
      .catch(err => {
        this.error = 'Failed to load reviews';
        this.loading = false;
      });
  }

  getStarsArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStarsArray(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }

  applyFilters(): void {
    this.filteredReviews = this.reviews.filter(review => {
      const statusMatch = this.statusFilter === 'ALL' || review.status === this.statusFilter;
      const ratingMatch = this.ratingFilter === 0 || review.rating === this.ratingFilter;
      return statusMatch && ratingMatch;
    });
  }

  filterByStatus(status: string): void {
    this.statusFilter = status;
    if (status === 'PENDING_APPROVAL') {
      this.loadReviews();
    } else {
      this.applyFilters();
    }
  }

  filterByRating(rating: number): void {
    this.ratingFilter = rating;
    this.applyFilters();
  }

  openDetailModal(review: any): void {
    this.selectedReview = review;
    this.adminReply = review.adminReply || '';
    this.rejectionReason = '';
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedReview = null;
    this.adminReply = '';
    this.rejectionReason = '';
    this.error = '';
  }

  approveReview(): void {
    if (!this.selectedReview) return;

    this.loading = true;
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    fetch(`/api/reviews/${this.selectedReview.id}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Id': user.id || '',
        'X-User-Role': user.role || ''
      }
    })
      .then(res => res.json())
      .then(data => {
        this.loading = false;
        this.successMessage = 'Review approved successfully!';
        setTimeout(() => this.successMessage = '', 3000);
        this.closeDetailModal();
        this.loadReviews();
      })
      .catch(err => {
        this.loading = false;
        this.error = 'Failed to approve review';
      });
  }

  rejectReview(): void {
    if (!this.selectedReview || !this.rejectionReason.trim()) {
      this.error = 'Please provide a rejection reason';
      return;
    }

    this.loading = true;
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    fetch(`/api/reviews/${this.selectedReview.id}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-User-Role': user.role || ''
      },
      body: JSON.stringify({ reason: this.rejectionReason })
    })
      .then(res => res.json())
      .then(data => {
        this.loading = false;
        this.successMessage = 'Review rejected successfully!';
        setTimeout(() => this.successMessage = '', 3000);
        this.closeDetailModal();
        this.loadReviews();
      })
      .catch(err => {
        this.loading = false;
        this.error = 'Failed to reject review';
      });
  }

  saveReply(): void {
    if (!this.selectedReview || !this.adminReply.trim()) {
      this.error = 'Please enter a reply';
      return;
    }

    this.loading = true;
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    fetch(`/api/reviews/${this.selectedReview.id}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-User-Role': user.role || ''
      },
      body: JSON.stringify({ reply: this.adminReply })
    })
      .then(res => res.json())
      .then(data => {
        this.loading = false;
        this.successMessage = 'Reply added successfully!';
        setTimeout(() => this.successMessage = '', 3000);
        this.selectedReview.adminReply = this.adminReply;
      })
      .catch(err => {
        this.loading = false;
        this.error = 'Failed to save reply';
      });
  }

  deleteReview(): void {
    if (!this.selectedReview) return;
    
    if (!confirm('Are you sure you want to delete this review permanently?')) {
      return;
    }

    this.loading = true;
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    fetch(`/api/reviews/admin/${this.selectedReview.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Role': user.role || ''
      }
    })
      .then(res => res.json())
      .then(data => {
        this.loading = false;
        this.successMessage = 'Review deleted successfully!';
        setTimeout(() => this.successMessage = '', 3000);
        this.closeDetailModal();
        this.loadReviews();
      })
      .catch(err => {
        this.loading = false;
        this.error = 'Failed to delete review';
      });
  }

  // Quick action methods for card buttons
  quickApprove(review: any): void {
    if (!confirm('Approve this review?')) return;
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    fetch(`/api/reviews/admin/${review.id}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Role': user.role || ''
      }
    })
      .then(res => res.json())
      .then(data => {
        this.successMessage = 'Review approved!';
        setTimeout(() => this.successMessage = '', 3000);
        this.loadReviews();
      })
      .catch(err => {
        this.error = 'Failed to approve review';
      });
  }

  openRejectModal(review: any): void {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    fetch(`/api/reviews/admin/${review.id}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-User-Role': user.role || ''
      },
      body: JSON.stringify({ reason })
    })
      .then(res => res.json())
      .then(data => {
        this.successMessage = 'Review rejected!';
        setTimeout(() => this.successMessage = '', 3000);
        this.loadReviews();
      })
      .catch(err => {
        this.error = 'Failed to reject review';
      });
  }

  quickDelete(review: any): void {
    if (!confirm('Are you sure you want to delete this review permanently?')) return;
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    fetch(`/api/reviews/admin/${review.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Role': user.role || ''
      }
    })
      .then(res => res.json())
      .then(data => {
        this.successMessage = 'Review deleted!';
        setTimeout(() => this.successMessage = '', 3000);
        this.loadReviews();
      })
      .catch(err => {
        this.error = 'Failed to delete review';
      });
  }
}
