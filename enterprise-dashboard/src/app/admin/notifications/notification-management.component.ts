import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  recipientTypes = [
    { value: 'ALL', label: 'All Users' },
    { value: 'UPCOMING_BOOKINGS', label: 'Users with Upcoming Bookings' },
    { value: 'CUSTOM', label: 'Custom User List' }
  ];

  notificationTypes = [
    'PROMOTIONAL',
    'ANNOUNCEMENT',
    'SYSTEM_UPDATE',
    'REMINDER',
    'SPECIAL_OFFER'
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
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

  openSendModal(): void {
    this.showSendModal = true;
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
    this.error = '';
  }

  sendNotification(): void {
    if (this.sendForm.invalid) {
      this.error = 'Please fill all required fields';
      return;
    }

    const formValue = this.sendForm.value;
    
    // Validate scheduling
    if (!formValue.scheduleNow && (!formValue.scheduleDate || !formValue.scheduleTime)) {
      this.error = 'Please provide schedule date and time';
      return;
    }

    this.loading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const notificationData = {
      recipientType: formValue.recipientType,
      type: formValue.notificationType,
      subject: formValue.subject,
      message: formValue.message,
      channels: Object.keys(formValue.channels).filter(key => formValue.channels[key]),
      scheduleNow: formValue.scheduleNow,
      scheduledFor: !formValue.scheduleNow 
        ? `${formValue.scheduleDate}T${formValue.scheduleTime}:00`
        : null
    };

    // Note: This endpoint needs to be implemented in notification-service
    fetch('/api/notifications/admin/send-bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-User-Id': user.id || '',
        'X-User-Role': user.role || ''
      },
      body: JSON.stringify(notificationData)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to send notification');
        }
        return res.json();
      })
      .then(data => {
        this.loading = false;
        this.successMessage = formValue.scheduleNow 
          ? 'Notification sent successfully!'
          : 'Notification scheduled successfully!';
        setTimeout(() => this.successMessage = '', 3000);
        this.closeSendModal();
      })
      .catch(err => {
        this.loading = false;
        this.error = err.message || 'Failed to send notification. This feature requires backend implementation.';
      });
  }

  getChannelsSelected(): number {
    const channels = this.sendForm.get('channels')?.value || {};
    return Object.values(channels).filter(v => v === true).length;
  }
}
