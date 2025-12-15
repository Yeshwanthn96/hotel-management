import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-service-management',
  templateUrl: './service-management.component.html',
  styleUrls: ['./service-management.component.css']
})
export class ServiceManagementComponent implements OnInit {
  services: any[] = [];
  filteredServices: any[] = [];
  showModal = false;
  editMode = false;
  serviceForm!: FormGroup;
  selectedService: any = null;
  loading = false;
  error = '';
  successMessage = '';

  categories = ['TRANSPORTATION', 'SPA', 'DINING', 'ENTERTAINMENT', 'LAUNDRY', 'CONFERENCE', 'TOURS'];
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.loadServices();
  }

  initForm(): void {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      duration: [60, [Validators.required, Validators.min(1)]],
      maxCapacity: [1, [Validators.required, Validators.min(1)]],
      imageUrl: [''],
      hotelIds: [[]],
      availability: [this.daysOfWeek],
      timeSlots: [[]]
    });
  }

  loadServices(): void {
    this.loading = true;
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    fetch('/api/services/admin/all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Role': user.role || ''
      }
    })
      .then(res => res.json())
      .then(data => {
        this.services = data;
        this.filteredServices = data;
        this.loading = false;
      })
      .catch(err => {
        this.error = 'Failed to load services';
        this.loading = false;
      });
  }

  openCreateModal(): void {
    this.editMode = false;
    this.selectedService = null;
    this.serviceForm.reset({
      availability: this.daysOfWeek,
      timeSlots: [],
      maxCapacity: 1,
      duration: 60,
      price: 0
    });
    this.showModal = true;
  }

  openEditModal(service: any): void {
    this.editMode = true;
    this.selectedService = service;
    this.serviceForm.patchValue({
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      duration: service.duration,
      maxCapacity: service.maxCapacity,
      imageUrl: service.imageUrl,
      hotelIds: service.hotelIds || [],
      availability: service.availability || this.daysOfWeek,
      timeSlots: service.timeSlots || []
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.serviceForm.reset();
    this.error = '';
  }

  saveService(): void {
    if (this.serviceForm.invalid) {
      this.error = 'Please fill all required fields';
      return;
    }

    this.loading = true;
    this.error = '';
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const serviceData = this.serviceForm.value;
    const url = this.editMode 
      ? `/api/services/admin/${this.selectedService.id}`
      : '/api/services/admin';
    const method = this.editMode ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-User-Id': user.id || '',
        'X-User-Role': user.role || ''
      },
      body: JSON.stringify(serviceData)
    })
      .then(res => res.json())
      .then(data => {
        this.loading = false;
        this.successMessage = this.editMode ? 'Service updated successfully!' : 'Service created successfully!';
        setTimeout(() => this.successMessage = '', 3000);
        this.closeModal();
        this.loadServices();
      })
      .catch(err => {
        this.loading = false;
        this.error = 'Failed to save service';
      });
  }

  deleteService(service: any): void {
    if (!confirm(`Are you sure you want to delete "${service.name}"?`)) {
      return;
    }

    this.loading = true;
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    fetch(`/api/services/admin/${service.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Role': user.role || ''
      }
    })
      .then(res => {
        this.loading = false;
        this.successMessage = 'Service deleted successfully!';
        setTimeout(() => this.successMessage = '', 3000);
        this.loadServices();
      })
      .catch(err => {
        this.loading = false;
        this.error = 'Failed to delete service';
      });
  }

  filterByCategory(category: string): void {
    if (category === 'ALL') {
      this.filteredServices = this.services;
    } else {
      this.filteredServices = this.services.filter(s => s.category === category);
    }
  }

  toggleAvailability(day: string): void {
    const current = this.serviceForm.get('availability')?.value || [];
    const index = current.indexOf(day);
    
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(day);
    }
    
    this.serviceForm.patchValue({ availability: current });
  }

  isDaySelected(day: string): boolean {
    const availability = this.serviceForm.get('availability')?.value || [];
    return availability.includes(day);
  }
}
