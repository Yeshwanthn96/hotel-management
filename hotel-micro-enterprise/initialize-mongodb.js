// Hotel Management System - MongoDB Initialization Script for Windows
// Run this script after installing MongoDB on Windows
// Execute: "C:\Program Files\MongoDB\Server\7.0\bin\mongosh.exe" < initialize-mongodb.js

print("========================================");
print("MongoDB Initialization Script");
print("Hotel Management System");
print("========================================");
print("");

// ======================
// 1. Users Database
// ======================
print("[1/7] Creating hotel_users database...");
db = db.getSiblingDB('hotel_users');
db.users.drop();
db.users.insertMany([
  {
    "_id": "admin-001",
    "username": "admin",
    "email": "admin@hotel.com",
    "password": "$2a$10$N9qo8uLOickgx2ZMRZoMye5J8f.hIDPKHR1zFV2F1j7YHLdL5LsJ6",
    "role": "ADMIN",
    "firstName": "Admin",
    "lastName": "User",
    "phoneNumber": "+1234567890",
    "createdAt": new Date("2025-01-15T10:00:00Z")
  },
  {
    "_id": "user-001",
    "username": "john.smith",
    "email": "john.smith@example.com",
    "password": "$2a$10$N9qo8uLOickgx2ZMRZoMye5J8f.hIDPKHR1zFV2F1j7YHLdL5LsJ6",
    "role": "USER",
    "firstName": "John",
    "lastName": "Smith",
    "phoneNumber": "+1987654321",
    "createdAt": new Date("2025-02-01T14:30:00Z")
  }
]);
print("✓ Users created: " + db.users.countDocuments());

// ======================
// 2. Hotels Database
// ======================
print("[2/7] Creating hotel_catalog database...");
db = db.getSiblingDB('hotel_catalog');
db.hotels.drop();
db.hotels.insertMany([
  {
    "_id": "1",
    "name": "Grand Plaza Hotel",
    "description": "Luxury hotel in the heart of the city",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001",
    "phoneNumber": "+1-212-555-0100",
    "email": "info@grandplaza.com",
    "starRating": 5,
    "amenities": ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Parking"]
  },
  {
    "_id": "2",
    "name": "Sunset Beach Resort",
    "description": "Beautiful beachfront resort",
    "address": "456 Ocean Drive",
    "city": "Miami",
    "state": "FL",
    "country": "USA",
    "zipCode": "33139",
    "phoneNumber": "+1-305-555-0200",
    "email": "contact@sunsetbeach.com",
    "starRating": 4,
    "amenities": ["WiFi", "Beach Access", "Pool", "Restaurant", "Water Sports"]
  },
  {
    "_id": "3",
    "name": "Mountain View Lodge",
    "description": "Cozy lodge with mountain views",
    "address": "789 Alpine Road",
    "city": "Denver",
    "state": "CO",
    "country": "USA",
    "zipCode": "80202",
    "phoneNumber": "+1-303-555-0300",
    "email": "reservations@mountainview.com",
    "starRating": 4,
    "amenities": ["WiFi", "Fireplace", "Hiking Trails", "Restaurant", "Ski Storage"]
  }
]);
print("✓ Hotels created: " + db.hotels.countDocuments());

// ======================
// 3. Rooms
// ======================
print("[3/7] Creating rooms in hotel_catalog...");
db.rooms.drop();
db.rooms.insertMany([
  {
    "_id": "room-001",
    "hotelId": "1",
    "roomNumber": "101",
    "roomType": "DELUXE",
    "description": "Spacious deluxe room with city view",
    "pricePerNight": 250.00,
    "capacity": 2,
    "amenities": ["King Bed", "WiFi", "Mini Bar", "City View"],
    "available": true
  },
  {
    "_id": "room-002",
    "hotelId": "1",
    "roomNumber": "201",
    "roomType": "SUITE",
    "description": "Luxury suite with separate living area",
    "pricePerNight": 450.00,
    "capacity": 4,
    "amenities": ["King Bed", "Living Room", "Kitchen", "WiFi", "Mini Bar"],
    "available": true
  },
  {
    "_id": "room-003",
    "hotelId": "2",
    "roomNumber": "301",
    "roomType": "DELUXE",
    "description": "Ocean view deluxe room",
    "pricePerNight": 300.00,
    "capacity": 2,
    "amenities": ["Queen Bed", "Ocean View", "WiFi", "Balcony"],
    "available": true
  },
  {
    "_id": "room-004",
    "hotelId": "2",
    "roomNumber": "401",
    "roomType": "SUITE",
    "description": "Beachfront suite with private terrace",
    "pricePerNight": 550.00,
    "capacity": 4,
    "amenities": ["King Bed", "Ocean View", "WiFi", "Private Terrace", "Jacuzzi"],
    "available": true
  },
  {
    "_id": "room-005",
    "hotelId": "3",
    "roomNumber": "101",
    "roomType": "STANDARD",
    "description": "Cozy standard room with mountain view",
    "pricePerNight": 150.00,
    "capacity": 2,
    "amenities": ["Queen Bed", "WiFi", "Mountain View", "Fireplace"],
    "available": true
  }
]);
print("✓ Rooms created: " + db.rooms.countDocuments());

// ======================
// 4. Bookings Database
// ======================
print("[4/7] Creating hotel_bookings database...");
db = db.getSiblingDB('hotel_bookings');
db.bookings.drop();
db.bookings.insertMany([
  {
    "_id": "booking-001",
    "userId": "user-001",
    "hotelId": "1",
    "roomId": "room-001",
    "checkInDate": "2025-12-10T15:00:00",
    "checkOutDate": "2025-12-15T11:00:00",
    "numberOfGuests": 2,
    "totalAmount": 1250.00,
    "status": "CONFIRMED",
    "bookingDate": "2025-11-20T10:30:00",
    "specialRequests": "Late check-in requested"
  },
  {
    "_id": "booking-002",
    "userId": "user-001",
    "hotelId": "2",
    "roomId": "room-003",
    "checkInDate": "2025-11-15T15:00:00",
    "checkOutDate": "2025-11-18T11:00:00",
    "numberOfGuests": 2,
    "totalAmount": 900.00,
    "status": "COMPLETED",
    "bookingDate": "2025-11-01T14:20:00",
    "specialRequests": "Ocean view preferred"
  },
  {
    "_id": "booking-003",
    "userId": "user-001",
    "hotelId": "1",
    "roomId": "room-002",
    "checkInDate": "2025-10-10T15:00:00",
    "checkOutDate": "2025-10-12T11:00:00",
    "numberOfGuests": 3,
    "totalAmount": 900.00,
    "status": "COMPLETED",
    "bookingDate": "2025-09-25T09:15:00",
    "specialRequests": "Extra towels please"
  },
  {
    "_id": "booking-004",
    "userId": "admin-001",
    "hotelId": "3",
    "roomId": "room-005",
    "checkInDate": "2025-12-20T15:00:00",
    "checkOutDate": "2025-12-25T11:00:00",
    "numberOfGuests": 2,
    "totalAmount": 750.00,
    "status": "CONFIRMED",
    "bookingDate": "2025-11-28T16:45:00",
    "specialRequests": "Quiet room preferred"
  },
  {
    "_id": "booking-005",
    "userId": "admin-001",
    "hotelId": "2",
    "roomId": "room-004",
    "checkInDate": "2025-11-01T15:00:00",
    "checkOutDate": "2025-11-05T11:00:00",
    "numberOfGuests": 2,
    "totalAmount": 2200.00,
    "status": "COMPLETED",
    "bookingDate": "2025-10-15T11:30:00",
    "specialRequests": "Honeymoon package"
  }
]);
print("✓ Bookings created: " + db.bookings.countDocuments());

// ======================
// 5. Payments Database
// ======================
print("[5/7] Creating hotel_payments database...");
db = db.getSiblingDB('hotel_payments');
db.payments.drop();
db.payments.insertMany([
  {
    "_id": "payment-001",
    "bookingId": "booking-001",
    "userId": "user-001",
    "amount": 1250.00,
    "paymentMethod": "CREDIT_CARD",
    "status": "COMPLETED",
    "transactionId": "txn_abc123def456",
    "paymentDate": "2025-11-20T10:31:00"
  },
  {
    "_id": "payment-002",
    "bookingId": "booking-002",
    "userId": "user-001",
    "amount": 900.00,
    "paymentMethod": "CREDIT_CARD",
    "status": "COMPLETED",
    "transactionId": "txn_xyz789ghi012",
    "paymentDate": "2025-11-01T14:21:00"
  },
  {
    "_id": "payment-003",
    "bookingId": "booking-003",
    "userId": "user-001",
    "amount": 900.00,
    "paymentMethod": "DEBIT_CARD",
    "status": "COMPLETED",
    "transactionId": "txn_def456ghi789",
    "paymentDate": "2025-09-25T09:16:00"
  },
  {
    "_id": "payment-004",
    "bookingId": "booking-004",
    "userId": "admin-001",
    "amount": 750.00,
    "paymentMethod": "CREDIT_CARD",
    "status": "COMPLETED",
    "transactionId": "txn_jkl012mno345",
    "paymentDate": "2025-11-28T16:46:00"
  },
  {
    "_id": "payment-005",
    "bookingId": "booking-005",
    "userId": "admin-001",
    "amount": 2200.00,
    "paymentMethod": "CREDIT_CARD",
    "status": "COMPLETED",
    "transactionId": "txn_pqr678stu901",
    "paymentDate": "2025-10-15T11:31:00"
  }
]);
print("✓ Payments created: " + db.payments.countDocuments());

// ======================
// 6. Reviews Database
// ======================
print("[6/7] Creating hotel_reviews database...");
db = db.getSiblingDB('hotel_reviews');
db.reviews.drop();
db.reviews.insertMany([
  {
    "_id": "review-001",
    "userId": "user-001",
    "hotelId": "2",
    "bookingId": "booking-002",
    "rating": 5,
    "title": "Amazing Beach Resort!",
    "comment": "Absolutely loved our stay at Sunset Beach Resort. The ocean view was breathtaking, staff was incredibly friendly, and the amenities were top-notch. Will definitely come back!",
    "createdAt": "2025-11-20T10:30:00",
    "verified": false
  },
  {
    "_id": "review-002",
    "userId": "user-001",
    "hotelId": "1",
    "bookingId": "booking-003",
    "rating": 4,
    "title": "Great Stay in NYC",
    "comment": "Grand Plaza Hotel exceeded our expectations. The suite was spacious and luxurious. Location is perfect for exploring the city. Only minor issue was the elevator wait times during peak hours.",
    "createdAt": "2025-10-15T08:20:00",
    "verified": false
  }
]);
print("✓ Reviews created: " + db.reviews.countDocuments());

// ======================
// 7. Notifications Database
// ======================
print("[7/7] Creating hotel_notifications database...");
db = db.getSiblingDB('hotel_notifications');
db.notificationLogs.drop();
db.createCollection("notificationLogs");
print("✓ Notifications collection created (empty)");

print("");
print("========================================");
print("✅ MongoDB Initialization Complete!");
print("========================================");
print("");
print("📊 Summary:");
print("  - Users: 2");
print("  - Hotels: 3");
print("  - Rooms: 5");
print("  - Bookings: 5");
print("  - Payments: 5");
print("  - Reviews: 2");
print("  - Notifications: 0 (will be populated by service)");
print("");
print("📝 Login Credentials:");
print("  Admin: admin@hotel.com / password123");
print("  User:  john.smith@example.com / password123");
print("");
print("🚀 Next Steps:");
print("  1. Run: START-ALL-WINDOWS.bat");
print("  2. Wait 2-3 minutes for services to start");
print("  3. Open: http://localhost:4200");
print("");
