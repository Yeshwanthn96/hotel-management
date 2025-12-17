import { Component, OnInit } from '@angular/core';
import { HotelService } from '../../services/hotel.service';

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

  editHotel: any = {
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

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels() {
    this.isLoading = true;
    this.hotelService.getAllHotels().subscribe({
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
    this.editHotel = { 
      ...hotel,
      amenities: hotel.amenities ? [...hotel.amenities] : [],
      images: hotel.images ? [...hotel.images] : []
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editHotel = {
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

  toggleAmenity(amenity: string) {
    const index = this.newHotel.amenities.indexOf(amenity);
    if (index > -1) {
      this.newHotel.amenities.splice(index, 1);
    } else {
      this.newHotel.amenities.push(amenity);
    }
  }

  toggleEditAmenity(amenity: string) {
    if (!this.editHotel.amenities) {
      this.editHotel.amenities = [];
    }
    const index = this.editHotel.amenities.indexOf(amenity);
    if (index > -1) {
      this.editHotel.amenities.splice(index, 1);
    } else {
      this.editHotel.amenities.push(amenity);
    }
  }

  isAmenitySelected(amenity: string): boolean {
    return this.newHotel.amenities.includes(amenity);
  }

  isEditAmenitySelected(amenity: string): boolean {
    return this.editHotel.amenities?.includes(amenity) || false;
  }

  addHotel() {
    if (!this.validateHotel()) {
      return;
    }

    this.isLoading = true;
    this.hotelService.createHotel(this.newHotel as any).subscribe({
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

  updateHotel() {
    if (!this.editHotel.name || !this.editHotel.city || !this.editHotel.address) {
      alert('Please fill in all required fields');
      return;
    }

    this.isLoading = true;
    this.hotelService.updateHotel(this.editHotel.id, this.editHotel).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.closeEditModal();
        this.loadHotels();
        alert('Hotel updated successfully!');
      },
      error: (error) => {
        this.isLoading = false;
        alert('Failed to update hotel: ' + (error.error?.error || error.message));
      }
    });
  }

  deleteHotel(hotel: any) {
    if (confirm(`Are you sure you want to delete "${hotel.name}"? This action cannot be undone.`)) {
      this.isLoading = true;
      this.hotelService.deleteHotel(hotel.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.loadHotels();
          alert('Hotel deleted successfully!');
        },
        error: (error) => {
          this.isLoading = false;
          alert('Failed to delete hotel: ' + (error.error?.error || error.message));
        }
      });
    }
  }

  validateHotel(): boolean {
    if (!this.newHotel.name || !this.newHotel.city || !this.newHotel.address) {
      alert('Please fill in all required fields');
      return false;
    }
    return true;
  }

  toggleHotelStatus(hotel: any) {
    const action = hotel.active ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} "${hotel.name}"?`)) return;

    this.isLoading = true;
    const toggleFn = hotel.active ? this.hotelService.deactivateHotel(hotel.id) : this.hotelService.activateHotel(hotel.id);
    toggleFn.subscribe({
      next: (response) => {
        this.isLoading = false;
        this.loadHotels();
        alert(`Hotel ${action}d successfully!`);
      },
      error: (error) => {
        this.isLoading = false;
        alert(`Failed to ${action} hotel: ` + (error.error?.error || error.message));
      }
    });
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
