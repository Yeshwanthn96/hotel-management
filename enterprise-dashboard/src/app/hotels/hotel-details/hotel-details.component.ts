import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HotelService, Hotel } from '../../services/hotel.service';
import { RoomService, Room, RoomSearchParams } from '../../services/room.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-hotel-details',
  templateUrl: './hotel-details.component.html',
  styleUrls: ['./hotel-details.component.css']
})
export class HotelDetailsComponent implements OnInit {
  hotel: Hotel | null = null;
  rooms: Room[] = [];
  loading = false;
  error = '';
  
  searchParams: RoomSearchParams = {};
  showRoomFilters = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hotelService: HotelService,
    private roomService: RoomService,
    public authService: AuthService
  ) {}
  
  ngOnInit() {
    const hotelId = this.route.snapshot.paramMap.get('id');
    if (hotelId) {
      this.loadHotel(hotelId);
      this.loadRooms(hotelId);
    }
  }
  
  loadHotel(hotelId: string) {
    this.loading = true;
    this.hotelService.getHotelById(hotelId).subscribe({
      next: (hotel) => {
        this.hotel = hotel;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load hotel details';
        this.loading = false;
        console.error(err);
      }
    });
  }
  
  loadRooms(hotelId: string) {
    this.roomService.getAvailableRoomsByHotel(hotelId).subscribe({
      next: (rooms) => {
        this.rooms = rooms;
      },
      error: (err) => {
        this.error = 'Failed to load rooms';
        console.error(err);
      }
    });
  }
  
  searchRooms() {
    if (!this.hotel) return;
    
    this.loading = true;
    this.roomService.searchRoomsByHotel(this.hotel.id, this.searchParams).subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Room search failed';
        this.loading = false;
        console.error(err);
      }
    });
  }
  
  clearRoomSearch() {
    this.searchParams = {};
    if (this.hotel) {
      this.loadRooms(this.hotel.id);
    }
  }
  
  hasRoomSearchParams(): boolean {
    return Object.keys(this.searchParams).some(key => 
      this.searchParams[key as keyof RoomSearchParams] !== undefined && 
      this.searchParams[key as keyof RoomSearchParams] !== ''
    );
  }
  
  bookRoom(room: Room) {
    // Navigate to booking page with pre-filled data
    this.router.navigate(['/bookings/add'], {
      queryParams: {
        hotelId: this.hotel?.id,
        roomId: room.id,
        checkIn: this.searchParams.checkIn,
        checkOut: this.searchParams.checkOut
      }
    });
  }
  
  manageRooms() {
    if (this.hotel) {
      this.router.navigate(['/hotels/rooms', this.hotel.id]);
    }
  }
  
  goBack() {
    this.router.navigate(['/hotels']);
  }
  
  calculateNights(): number {
    if (!this.searchParams.checkIn || !this.searchParams.checkOut) return 1;
    
    const checkIn = new Date(this.searchParams.checkIn);
    const checkOut = new Date(this.searchParams.checkOut);
    const diff = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24)) || 1;
  }
  
  getTotalPrice(room: Room): number {
    return room.pricePerNight * this.calculateNights();
  }
  
  getHotelHeroImage(hotel: Hotel): string {
    if (hotel.imageUrl) return hotel.imageUrl;
    
    const heroImages = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=600&fit=crop', // Modern luxury hotel
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&h=600&fit=crop', // Resort exterior
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&h=600&fit=crop', // Beach resort
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&h=600&fit=crop', // City skyline hotel
    ];
    
    const hash = hotel.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return heroImages[hash % heroImages.length];
  }
  
  getRoomImageByIndex(roomType: string, index: number): string {
    const roomImageSets: { [key: string]: string[] } = {
      'Single': [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&h=500&fit=crop',
      ],
      'Double': [
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&h=500&fit=crop',
      ],
      'Suite': [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1631049552240-59c37f38802b?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=500&fit=crop',
      ],
      'Deluxe': [
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&h=500&fit=crop',
      ],
      'Presidential Suite': [
        'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=500&fit=crop',
      ]
    };
    
    const images = roomImageSets[roomType] || roomImageSets['Single'];
    return images[index % images.length];
  }
  
  getRoomImage(roomType: string): string {
    return this.getRoomImageByIndex(roomType, 0);
  }
}
