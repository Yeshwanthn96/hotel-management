import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HotelService, Hotel } from '../../services/hotel.service';
import { RoomService, Room } from '../../services/room.service';

@Component({
  selector: 'app-room-management',
  templateUrl: './room-management.component.html',
  styleUrls: ['./room-management.component.css']
})
export class RoomManagementComponent implements OnInit {
  hotel: Hotel | null = null;
  rooms: Room[] = [];
  loading = false;
  error = '';
  showAddRoom = false;
  
  newRoom: Partial<Room> = this.getEmptyRoom();
  amenityInput = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hotelService: HotelService,
    private roomService: RoomService
  ) {}
  
  ngOnInit() {
    const hotelId = this.route.snapshot.paramMap.get('id');
    if (hotelId) {
      this.loadHotel(hotelId);
      this.loadRooms(hotelId);
    }
  }
  
  getEmptyRoom(): Partial<Room> {
    return {
      hotelId: this.route.snapshot.paramMap.get('id') || '',
      roomNumber: '',
      roomType: 'Standard',
      description: '',
      capacity: 2,
      pricePerNight: 0,
      amenities: [],
      active: true
    };
  }
  
  loadHotel(hotelId: string) {
    this.hotelService.getHotelById(hotelId).subscribe({
      next: (hotel) => {
        this.hotel = hotel;
        this.newRoom.hotelId = hotelId;
      },
      error: (err) => {
        this.error = 'Failed to load hotel';
        console.error(err);
      }
    });
  }
  
  loadRooms(hotelId: string) {
    this.loading = true;
    this.roomService.getAvailableRoomsByHotel(hotelId).subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load rooms';
        this.loading = false;
        console.error(err);
      }
    });
  }
  
  addAmenity() {
    if (this.amenityInput.trim() && !this.newRoom.amenities?.includes(this.amenityInput.trim())) {
      this.newRoom.amenities = [...(this.newRoom.amenities || []), this.amenityInput.trim()];
      this.amenityInput = '';
    }
  }
  
  removeAmenity(amenity: string) {
    this.newRoom.amenities = this.newRoom.amenities?.filter(a => a !== amenity) || [];
  }
  
  saveRoom() {
    if (!this.validateRoom()) {
      this.error = 'Please fill in all required fields';
      return;
    }
    
    this.loading = true;
    this.roomService.createRoom(this.newRoom as Room).subscribe({
      next: () => {
        this.showAddRoom = false;
        this.newRoom = this.getEmptyRoom();
        if (this.hotel) {
          this.loadRooms(this.hotel.id);
        }
      },
      error: (err) => {
        this.error = 'Failed to save room';
        this.loading = false;
        console.error(err);
      }
    });
  }
  
  validateRoom(): boolean {
    return !!(this.newRoom.roomNumber && this.newRoom.roomType && 
              this.newRoom.capacity && this.newRoom.pricePerNight);
  }
  
  toggleActive(room: Room) {
    const action = room.active
      ? this.roomService.deactivateRoom(room.id)
      : this.roomService.activateRoom(room.id);
    
    action.subscribe({
      next: () => {
        if (this.hotel) {
          this.loadRooms(this.hotel.id);
        }
      },
      error: (err) => {
        this.error = 'Failed to update room status';
        console.error(err);
      }
    });
  }
  
  deleteRoom(room: Room) {
    if (confirm(`Delete room ${room.roomNumber}?`)) {
      this.roomService.deleteRoom(room.id).subscribe({
        next: () => {
          if (this.hotel) {
            this.loadRooms(this.hotel.id);
          }
        },
        error: (err) => {
          this.error = 'Failed to delete room';
          console.error(err);
        }
      });
    }
  }
  
  goBack() {
    this.router.navigate(['/hotels']);
  }
}
