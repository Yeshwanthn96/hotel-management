import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BookingsService, BookingRequest } from '../../services/bookings.service';
import { HotelService, Hotel } from '../../services/hotel.service';
import { RoomService, Room } from '../../services/room.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-bookings-add',
  templateUrl: './bookings-add.component.html'
})
export class BookingsAddComponent implements OnInit {
  hotels: Hotel[] = [];
  rooms: Room[] = [];
  userId: string | null = null;
  
  booking = {
    hotelId: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    paymentMethod: 'MOCK'
  };
  
  constructor(
    private bookingService: BookingsService,
    private hotelService: HotelService,
    private roomService: RoomService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      alert('Please login to make a booking');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.userId = this.authService.getUserId();
    this.loadHotels();
    
    // Pre-fill if coming from hotel details
    this.route.queryParams.subscribe(params => {
      if (params['hotelId']) this.booking.hotelId = params['hotelId'];
      if (params['roomId']) this.booking.roomId = params['roomId'];
      if (this.booking.hotelId) this.onHotelChange();
    });
  }
  
  loadHotels() {
    this.hotelService.getAllHotels().subscribe(data => this.hotels = data);
  }
  
  onHotelChange() {
    if (this.booking.hotelId) {
      this.roomService.getAvailableRoomsByHotel(this.booking.hotelId).subscribe(data => this.rooms = data);
    } else {
      this.rooms = [];
      this.booking.roomId = '';
    }
  }
  
  createBooking() {
    if (!this.authService.isAuthenticated() || !this.userId) {
      alert('Please login to make a booking');
      this.router.navigate(['/auth/login']);
      return;
    }
    
    if (!this.booking.hotelId || !this.booking.roomId || !this.booking.checkInDate || !this.booking.checkOutDate) {
      alert('Please fill all required fields');
      return;
    }
    
    const request: BookingRequest = {
      userId: this.userId,
      hotelId: this.booking.hotelId,
      roomId: this.booking.roomId,
      checkInDate: this.booking.checkInDate,
      checkOutDate: this.booking.checkOutDate,
      numberOfGuests: this.booking.numberOfGuests,
      paymentMethod: this.booking.paymentMethod
    };
    
    this.bookingService.createBooking(request).subscribe({
      next: (result) => {
        alert(`Booking created! Status: ${result.status}. ${result.message || ''}`);
        this.router.navigate(['/bookings']);
      },
      error: (err) => alert(`Booking failed: ${err.error?.message || err.message}`)
    });
  }
}
