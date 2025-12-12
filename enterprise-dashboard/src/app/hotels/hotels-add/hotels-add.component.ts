import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HotelService, Hotel } from '../../services/hotel.service';

@Component({
  selector: 'app-hotels-add',
  templateUrl: './hotels-add.component.html',
  styleUrls: ['./hotels-add.component.css']
})
export class HotelsAddComponent implements OnInit {
  isEditMode = false;
  hotelId: string | null = null;
  loading = false;
  error = '';
  
  hotel: Partial<Hotel> = {
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    starRating: 3,
    amenities: [],
    checkInTime: '15:00',
    checkOutTime: '11:00',
    active: true
  };
  
  amenityInput = '';
  
  constructor(
    private hotelService: HotelService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit() {
    this.hotelId = this.route.snapshot.paramMap.get('id');
    if (this.hotelId) {
      this.isEditMode = true;
      this.loadHotel(this.hotelId);
    }
  }
  
  loadHotel(id: string) {
    this.loading = true;
    this.hotelService.getHotelById(id).subscribe({
      next: (hotel) => {
        this.hotel = hotel;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load hotel';
        this.loading = false;
        console.error(err);
      }
    });
  }
  
  addAmenity() {
    if (this.amenityInput.trim() && !this.hotel.amenities?.includes(this.amenityInput.trim())) {
      this.hotel.amenities = [...(this.hotel.amenities || []), this.amenityInput.trim()];
      this.amenityInput = '';
    }
  }
  
  removeAmenity(amenity: string) {
    this.hotel.amenities = this.hotel.amenities?.filter(a => a !== amenity) || [];
  }
  
  save() {
    if (!this.validateForm()) {
      this.error = 'Please fill in all required fields';
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    const operation = this.isEditMode && this.hotelId
      ? this.hotelService.updateHotel(this.hotelId, this.hotel as Hotel)
      : this.hotelService.createHotel(this.hotel as Hotel);
    
    operation.subscribe({
      next: () => {
        this.router.navigate(['/hotels']);
      },
      error: (err) => {
        this.error = 'Failed to save hotel';
        this.loading = false;
        console.error(err);
      }
    });
  }
  
  validateForm(): boolean {
    return !!(this.hotel.name && this.hotel.address && this.hotel.city && 
              this.hotel.state && this.hotel.email && this.hotel.phone);
  }
  
  cancel() {
    this.router.navigate(['/hotels']);
  }
}
