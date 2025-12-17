import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-notification-management',
  templateUrl: './notification-management.component.html',
  styleUrls: ['./notification-management.component.css']
})
export class NotificationManagementComponent implements OnInit {
  showSendModal = false;
  sendForm!: FormGroup;
  loading = false;
  error = '';
  successMessage = '';

  users: any[] = [];
  selectedUserIds: string[] = [];

  recipientTypes = [
    { value: 'ALL', label: 'All Users' },
    { value: 'SPECIFIC', label: 'Specific Users' },
    { value: 'UPCOMING_BOOKINGS', label: 'Users with Upcoming Bookings' }
  ];

  notificationTypes = [
    'PROMOTIONAL',
    'ANNOUNCEMENT',
    'SYSTEM_UPDATE',
    'REMINDER',
    'SPECIAL_OFFER',
    'BOOKING_UPDATE'
  ];

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<any>('/api/users/all').subscribe({
      next: (response) => this.users = response.users || response || [],
      error: (err) => console.error('Failed to load users:', err)
    });
  }

  initForm(): void {
    this.sendForm = this.fb.group({
      recipientType: ['ALL', Validators.required],
      notificationType: ['PROMOTIONAL', Validators.required],
      subject: ['', Validators.required],
      message: ['', Validators.required],
      channels: this.fb.group({
        email: [true],
        sms: [false],
        inApp: [true]
      }),
      scheduleNow: [true],
      scheduleDate: [''],
      scheduleTime: ['']
    });
  }

  toggleUserSelection(userId: string): void {
    const index = this.selectedUserIds.indexOf(userId);
    if (index > -1) {
      this.selectedUserIds.splice(index, 1);
    } else {
      this.selectedUserIds.push(userId);
    }
  }

  isUserSelected(userId: string): boolean {
    return this.selectedUserIds.includes(userId);
  }

  selectAllUsers(): void {
    this.selectedUserIds = this.users.map(u => u.id);
  }

  clearUserSelection(): void {
    this.selectedUserIds = [];
  }

  openSendModal(): void {
    this.showSendModal = true;
    this.selectedUserIds = [];
    this.sendForm.reset({
      recipientType: 'ALL',
      notificationType: 'PROMOTIONAL',
      channels: {
        email: true,
        sms: false,
        inApp: true
      },
      scheduleNow: true
    });
    this.error = '';
  }

  closeSendModal(): void {
    this.showSendModal = false;
    this.sendForm.reset();
    this.selectedUserIds = [];
    this.error = '';
  }

  sendNotification(): void {
    if (this.sendForm.invalid) {
      this.error = 'Please fill all required fields';
      return;
    }

    const formValue = this.sendForm.value;

    // Validate specific user selection
    if (formValue.recipientType === 'SPECIFIC' && this.selectedUserIds.length === 0) {
      this.error = 'Please select at least one user';
      return;
    }
    
    // Validate scheduling
    if (!formValue.scheduleNow && (!formValue.scheduleDate || !formValue.scheduleTime)) {
      this.error = 'Please provide schedule date and time';
      return;
    }

    this.loading = true;
    this.error = '';

    const notificationData = {
      recipientType: formValue.recipientType,
      userIds: formValue.recipientType === 'SPECIFIC' ? this.selectedUserIds : [],
      type: formValue.notificationType,
      subject: formValue.subject,
      message: formValue.message,
      channels: Object.keys(formValue.channels).filter(key => formValue.channels[key]),
      scheduleNow: formValue.scheduleNow,
      scheduledFor: !formValue.scheduleNow 
        ? `${formValue.scheduleDate}T${formValue.scheduleTime}:00`
        : null
    };

    this.http.post('/api/notifications/admin/send-bulk', notificationData).subscribe({
      next: (data) => {
        this.loading = false;
        this.successMessage = formValue.scheduleNow 
          ? `Notification sent to ${formValue.recipientType === 'SPECIFIC' ? this.selectedUserIds.length + ' users' : 'all users'}!`
          : 'Notification scheduled successfully!';
        setTimeout(() => this.successMessage = '', 5000);
        this.closeSendModal();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to send notification. Backend implementation may be required.';
      }
    });
  }

  getChannelsSelected(): number {
    const channels = this.sendForm.get('channels')?.value || {};
    return Object.values(channels).filter(v => v === true).length;
  }
}
