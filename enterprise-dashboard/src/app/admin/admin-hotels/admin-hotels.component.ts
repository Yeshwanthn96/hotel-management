import { Component, OnInit } from '@angular/core';
import { HotelsService } from '../../services/hotels.service';

@Component({
  selector: 'app-admin-hotels',
  templateUrl: './admin-hotels.component.html',
  styleUrls: ['./admin-hotels.component.css']
})
export class AdminHotelsComponent implements OnInit {
  hotels: any[] = [];
  showAddModal = false;
  showEditModal = false;
  selectedHotel: any = null;
  isLoading = false;
  
  newHotel = {
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phone: '',
    email: '',
    rating: 4.0,
    amenities: [] as string[],
    images: [] as string[]
  };

  availableAmenities = [
    '📶 Free WiFi',
    '🏊 Swimming Pool',
    '🏋️ Gym',
    '🍽️ Restaurant',
    '☕ Café',
    '🅿️ Parking',
    '🌡️ AC',
    '💼 Business Center',
    '🧖 Spa',
    '🚕 Airport Shuttle',
    '👶 Kid Friendly',
    '🐕 Pet Friendly'
  ];

  constructor(private hotelsService: HotelsService) {}

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels() {
    this.isLoading = true;
    this.hotelsService.list().subscribe({
      next: (response) => {
        this.hotels = response || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading hotels:', error);
        this.isLoading = false;
      }
    });
  }

  openAddModal() {
    this.resetForm();
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.resetForm();
  }

  openEditModal(hotel: any) {
    this.selectedHotel = { ...hotel };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedHotel = null;
  }

  toggleAmenity(amenity: string) {
    const index = this.newHotel.amenities.indexOf(amenity);
    if (index > -1) {
      this.newHotel.amenities.splice(index, 1);
    } else {
      this.newHotel.amenities.push(amenity);
    }
  }

  isAmenitySelected(amenity: string): boolean {
    return this.newHotel.amenities.includes(amenity);
  }

  addHotel() {
    if (!this.validateHotel()) {
      return;
    }

    this.isLoading = true;
    this.hotelsService.add(this.newHotel).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.closeAddModal();
        this.loadHotels();
        alert('Hotel added successfully!');
      },
      error: (error) => {
        this.isLoading = false;
        alert('Failed to add hotel: ' + (error.error?.error || error.message));
      }
    });
  }

  deleteHotel(hotel: any) {
    if (confirm(`Are you sure you want to delete ${hotel.name}?`)) {
      // TODO: Implement delete API call
      alert('Delete functionality to be implemented');
    }
  }

  validateHotel(): boolean {
    if (!this.newHotel.name || !this.newHotel.city || !this.newHotel.address) {
      alert('Please fill in all required fields');
      return false;
    }
    return true;
  }

  resetForm() {
    this.newHotel = {
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      phone: '',
      email: '',
      rating: 4.0,
      amenities: [],
      images: []
    };
  }
}
