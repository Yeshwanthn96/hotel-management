import { Component, OnInit } from '@angular/core';
import { HotelService, Hotel, HotelSearchRequest } from '../../services/hotel.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hotels-list',
  templateUrl: './hotels-list.component.html',
  styleUrls: ['./hotels-list.component.css']
})
export class HotelsListComponent implements OnInit {
  hotels: Hotel[] = [];
  filteredHotels: Hotel[] = [];
  loading = false;
  error = '';
  
  searchParams: HotelSearchRequest = {};
  showSearchFilters = false;
  
  constructor(
    private hotelService: HotelService,
    public authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.loadHotels();
  }
  
  loadHotels() {
    this.loading = true;
    this.error = '';
    
    const observable = this.authService.isAdmin() 
      ? this.hotelService.getAllHotels() 
      : this.hotelService.getActiveHotels();
    
    observable.subscribe({
      next: (hotels) => {
        this.hotels = hotels;
        this.filteredHotels = hotels;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load hotels';
        this.loading = false;
        console.error(err);
      }
    });
  }
  
  searchHotels() {
    if (!this.hasSearchParams()) {
      this.filteredHotels = this.hotels;
      return;
    }
    
    this.loading = true;
    this.hotelService.searchHotels(this.searchParams).subscribe({
      next: (hotels) => {
        this.filteredHotels = hotels;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Search failed';
        this.loading = false;
        console.error(err);
      }
    });
  }
  
  clearSearch() {
    this.searchParams = {};
    this.filteredHotels = this.hotels;
  }
  
  hasSearchParams(): boolean {
    return Object.keys(this.searchParams).some(key => 
      this.searchParams[key as keyof HotelSearchRequest] !== undefined && 
      this.searchParams[key as keyof HotelSearchRequest] !== ''
    );
  }
  
  viewDetails(hotelId: string) {
    this.router.navigate(['/hotels/details', hotelId]);
  }
  
  editHotel(hotelId: string) {
    this.router.navigate(['/hotels/edit', hotelId]);
  }
  
  deleteHotel(hotel: Hotel) {
    if (confirm(`Are you sure you want to delete ${hotel.name}?`)) {
      this.hotelService.deleteHotel(hotel.id).subscribe({
        next: () => {
          this.loadHotels();
        },
        error: (err) => {
          this.error = 'Failed to delete hotel';
          console.error(err);
        }
      });
    }
  }
  
  toggleActive(hotel: Hotel) {
    const action = hotel.active 
      ? this.hotelService.deactivateHotel(hotel.id) 
      : this.hotelService.activateHotel(hotel.id);
    
    action.subscribe({
      next: () => {
        this.loadHotels();
      },
      error: (err) => {
        this.error = 'Failed to update hotel status';
        console.error(err);
      }
    });
  }
  
  getHotelImage(hotel: Hotel, index: number): string {
    if (hotel.imageUrl) return hotel.imageUrl;
    
    const hotelImages = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop', // Modern hotel
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=500&fit=crop', // Luxury resort
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=500&fit=crop', // Beach hotel
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=500&fit=crop', // City hotel
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&h=500&fit=crop', // Mountain resort
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=500&fit=crop', // Boutique hotel
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=500&fit=crop', // Downtown hotel
      'https://images.unsplash.com/photo-1587874269710-0a676f7a2f9f?w=800&h=500&fit=crop', // Waterfront hotel
    ];
    
    return hotelImages[index % hotelImages.length];
  }
}
