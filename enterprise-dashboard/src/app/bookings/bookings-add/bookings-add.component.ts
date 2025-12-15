import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BookingsService, BookingRequest } from '../../services/bookings.service';
import { HotelService, Hotel } from '../../services/hotel.service';
import { RoomService, Room } from '../../services/room.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-bookings-add',
  templateUrl: './bookings-add.component.html',
  styleUrls: ['./bookings-add.component.css']
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
    paymentMethod: 'STRIPE'  // Default to STRIPE
  };

  cardDetails = {
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: ''
  };

  paypalDetails = {
    email: '',
    password: ''
  };

  // Card validation states
  cardBrand = '';
  cardNumberError = '';
  expiryError = '';
  cvvError = '';
  cardNameError = '';
  
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

  // Card formatting methods
  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = '';
    
    // Detect card brand
    if (value.startsWith('4')) {
      this.cardBrand = 'visa';
    } else if (value.startsWith('5')) {
      this.cardBrand = 'mastercard';
    } else if (value.startsWith('3')) {
      this.cardBrand = 'amex';
    } else {
      this.cardBrand = '';
    }
    
    // Format with spaces
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += value[i];
    }
    
    this.cardDetails.cardNumber = formattedValue;
    this.cardNumberError = '';
  }

  formatExpiry(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
      value = value.substring(0, 2) + ' / ' + value.substring(2, 4);
    }
    
    this.cardDetails.expiry = value;
    this.expiryError = '';
  }

  formatCVV(event: any) {
    this.cardDetails.cvv = event.target.value.replace(/\D/g, '');
    this.cvvError = '';
  }

  // Validation methods
  validateCardNumber() {
    const cardNum = this.cardDetails.cardNumber.replace(/\s/g, '');
    
    if (!cardNum) {
      this.cardNumberError = 'Card number is required';
      return false;
    }
    
    if (cardNum.length < 13 || cardNum.length > 19) {
      this.cardNumberError = 'Invalid card number length';
      return false;
    }
    
    // Luhn algorithm validation
    if (!this.luhnCheck(cardNum)) {
      this.cardNumberError = 'Invalid card number';
      return false;
    }
    
    this.cardNumberError = '';
    return true;
  }

  validateExpiry() {
    const expiry = this.cardDetails.expiry.replace(/\s|\/\s/g, '');
    
    if (!expiry || expiry.length !== 4) {
      this.expiryError = 'Invalid expiry date';
      return false;
    }
    
    const month = parseInt(expiry.substring(0, 2));
    const year = parseInt('20' + expiry.substring(2, 4));
    
    if (month < 1 || month > 12) {
      this.expiryError = 'Invalid month';
      return false;
    }
    
    const now = new Date();
    const expDate = new Date(year, month - 1);
    
    if (expDate < now) {
      this.expiryError = 'Card has expired';
      return false;
    }
    
    this.expiryError = '';
    return true;
  }

  validateCVV() {
    if (!this.cardDetails.cvv || (this.cardDetails.cvv.length < 3 || this.cardDetails.cvv.length > 4)) {
      this.cvvError = 'Invalid CVC';
      return false;
    }
    
    this.cvvError = '';
    return true;
  }

  validateCardName() {
    if (!this.cardDetails.cardName || this.cardDetails.cardName.trim().length < 3) {
      this.cardNameError = 'Please enter cardholder name';
      return false;
    }
    
    this.cardNameError = '';
    return true;
  }

  luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i));
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  getCardBrandIcon(): string {
    const icons: any = {
      'visa': 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
      'mastercard': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
      'amex': 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg'
    };
    return icons[this.cardBrand] || '';
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

    // Validate payment details
    if (this.booking.paymentMethod === 'STRIPE') {
      // Validate all fields
      const isCardValid = this.validateCardNumber();
      const isExpiryValid = this.validateExpiry();
      const isCVVValid = this.validateCVV();
      const isNameValid = this.validateCardName();
      
      if (!isCardValid || !isExpiryValid || !isCVVValid || !isNameValid) {
        alert('Please fix the errors in your card details');
        return;
      }
    } else if (this.booking.paymentMethod === 'PAYPAL') {
      if (!this.paypalDetails.email || !this.paypalDetails.password) {
        alert('Please fill in all PayPal details');
        return;
      }
      // Mock validation - accept test credentials
      if (this.paypalDetails.email !== 'test@paypal.com' || this.paypalDetails.password !== 'password123') {
        alert('Invalid PayPal credentials. Use test@paypal.com / password123');
        return;
      }
    }
    
    const request: BookingRequest = {
      userId: this.userId,
      hotelId: this.booking.hotelId,
      roomId: this.booking.roomId,
      checkInDate: this.booking.checkInDate,
      checkOutDate: this.booking.checkOutDate,
      numberOfGuests: this.booking.numberOfGuests,
      paymentMethod: 'MOCK'  // Backend still uses MOCK for testing
    };
    
    this.bookingService.createBooking(request).subscribe({
      next: (result) => {
        let paymentInfo = '';
        if (this.booking.paymentMethod === 'STRIPE') {
          const lastFour = this.cardDetails.cardNumber.replace(/\s/g, '').slice(-4);
          const cardType = this.cardBrand.charAt(0).toUpperCase() + this.cardBrand.slice(1);
          paymentInfo = `${cardType} ending in ${lastFour}`;
        } else {
          paymentInfo = `PayPal (${this.paypalDetails.email})`;
        }
        
        alert(`✅ Payment Successful!\n\n🏛️ Booking Confirmed\nPayment: ${paymentInfo}\nStatus: ${result.status}`);
        this.router.navigate(['/bookings']);
      },
      error: (err) => alert(`❌ Payment Failed: ${err.error?.message || err.message}`)
    });
  }
}
