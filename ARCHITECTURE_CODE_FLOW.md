# Hotel Management System - Architecture & Code Flow Documentation

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Microservices Architecture](#microservices-architecture)
3. [Request Flow Layers](#request-flow-layers)
4. [Service Communication Pattern](#service-communication-pattern)
5. [Authentication Flow](#authentication-flow)
6. [Booking Creation Flow](#booking-creation-flow)
7. [Data Flow Diagrams](#data-flow-diagrams)

---

## System Architecture Overview

### Technology Stack

- **Backend**: Java 17, Spring Boot 2.7.12
- **Frontend**: Angular 15
- **Database**: MongoDB 7.0
- **Service Discovery**: Netflix Eureka
- **API Gateway**: Spring Cloud Gateway
- **Message Queue**: Apache Kafka

### Architecture Pattern

- **Microservices Architecture** with Service Registry
- **Saga Pattern** for distributed transactions
- **JWT-based Authentication** for security
- **Event-Driven Architecture** for async operations

---

## Microservices Architecture

### Service Registry (Port: 8761)

**Location**: `service-registry/`

- **Main Class**: `ServiceRegistryApplication.java`
- **Purpose**: Netflix Eureka server for service discovery
- **Dependencies**: All microservices register here

### API Gateway (Port: 8080)

**Location**: `api-gateway/`

- **Main Class**: `ApiGatewayApplication.java`
- **Purpose**: Single entry point for all client requests
- **Routes**: Forwards requests to respective microservices
- **Features**:
  - CORS configuration
  - JWT validation
  - Load balancing

### User Service (Port: 8091)

**Location**: `user-service/`

#### File Structure:

```
src/main/java/com/example/userservice/
├── UserServiceApplication.java          # Main entry point
├── controller/
│   └── UserController.java              # REST endpoints
├── service/
│   └── UserService.java                 # Business logic
├── repository/
│   └── UserRepository.java              # MongoDB data access
├── model/
│   ├── User.java                        # User entity
│   └── Role.java                        # Role enum (USER, ADMIN)
├── dto/
│   ├── LoginRequest.java                # Login input
│   ├── LoginResponse.java               # Login output with JWT
│   ├── RegisterRequest.java             # Registration input
│   ├── ChangePasswordRequest.java       # Password change input
│   └── ResetPasswordRequest.java        # Password reset input
└── config/
    └── SecurityConfig.java              # Spring Security setup
```

#### Layer Flow:

```
HTTP Request → UserController → UserService → UserRepository → MongoDB
                      ↓                ↓
                JWT Utils         Password Encoder
```

#### Key Endpoints:

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User authentication
- `POST /api/users/change-password` - Change password
- `POST /api/users/reset-password` - Reset password
- `GET /api/users/profile` - Get user profile

### Hotel Service (Port: 8092)

**Location**: `hotel-service/`

#### File Structure:

```
src/main/java/com/example/hotelservice/
├── HotelServiceApplication.java
├── controller/
│   ├── HotelController.java             # Hotel CRUD operations
│   └── RoomController.java              # Room management
├── service/
│   ├── HotelService.java                # Hotel business logic
│   └── RoomService.java                 # Room business logic
├── repository/
│   ├── HotelRepository.java             # Hotel data access
│   └── RoomRepository.java              # Room data access
├── model/
│   ├── Hotel.java                       # Hotel entity
│   ├── Room.java                        # Room entity
│   ├── Address.java                     # Embedded address
│   └── Amenity.java                     # Hotel amenities enum
└── dto/
    ├── HotelRequest.java
    ├── HotelResponse.java
    ├── RoomRequest.java
    └── RoomResponse.java
```

#### Layer Flow:

```
HTTP Request → HotelController → HotelService → HotelRepository → MongoDB
                                      ↓
                              Kafka Event Publisher
```

### Booking Service (Port: 8093)

**Location**: `booking-service/`

#### File Structure:

```
src/main/java/com/example/bookingservice/
├── BookingServiceApplication.java
├── controller/
│   └── BookingController.java           # Booking endpoints
├── service/
│   └── BookingService.java              # Orchestrates booking saga
├── repository/
│   └── BookingRepository.java           # Booking data access
├── model/
│   ├── Booking.java                     # Booking entity
│   └── BookingStatus.java               # Status enum
├── dto/
│   ├── BookingRequest.java              # Booking input
│   └── BookingResponse.java             # Booking output (enriched)
├── saga/
│   ├── BookingSagaOrchestrator.java     # Saga coordinator
│   ├── SagaContext.java                 # Saga state holder
│   └── steps/
│       ├── ValidateBookingStep.java     # Step 1: Validation
│       ├── HoldRoomStep.java            # Step 2: Reserve room
│       ├── ProcessPaymentStep.java      # Step 3: Process payment
│       └── ConfirmBookingStep.java      # Step 4: Confirm booking
└── config/
    └── RestTemplateConfig.java          # HTTP client config
```

#### Saga Pattern Flow:

```
BookingController
       ↓
BookingService.createBooking()
       ↓
BookingSagaOrchestrator.execute()
       ↓
┌─────────────────────────────────────────────┐
│ SAGA STEPS (Sequential Execution)          │
├─────────────────────────────────────────────┤
│ 1. ValidateBookingStep                      │
│    - Validate dates, guest count, etc.      │
│    - Check business rules                   │
│         ↓                                    │
│ 2. HoldRoomStep                             │
│    - Call Hotel Service via RestTemplate    │
│    - Reserve the room                       │
│         ↓                                    │
│ 3. ProcessPaymentStep                       │
│    - Check payment method (MOCK/REAL)       │
│    - Set status: CONFIRMED or PENDING       │
│         ↓                                    │
│ 4. ConfirmBookingStep                       │
│    - Save booking to MongoDB                │
│    - Publish Kafka event                    │
└─────────────────────────────────────────────┘
       ↓
BookingResponse (enriched with hotel/room details)
```

### Payment Service (Port: 8094)

**Location**: `payment-service/`

#### File Structure:

```
src/main/java/com/example/paymentservice/
├── PaymentServiceApplication.java
├── controller/
│   └── PaymentController.java           # Payment endpoints
├── service/
│   └── PaymentService.java              # Payment processing
├── repository/
│   └── PaymentRepository.java           # Payment records
├── model/
│   ├── Payment.java                     # Payment entity
│   └── PaymentStatus.java               # Status enum
└── dto/
    ├── PaymentRequest.java
    └── PaymentResponse.java
```

### Review Service (Port: 8095)

**Location**: `review-service/`

#### File Structure:

```
src/main/java/com/example/reviewservice/
├── ReviewServiceApplication.java
├── controller/
│   └── ReviewController.java
├── service/
│   └── ReviewService.java
├── repository/
│   └── ReviewRepository.java
└── model/
    └── Review.java
```

### Notification Service (Port: 8096)

**Location**: `notification-service/`

#### File Structure:

```
src/main/java/com/example/notificationservice/
├── NotificationServiceApplication.java
├── controller/
│   └── NotificationController.java
├── service/
│   └── NotificationService.java
├── listener/
│   └── KafkaEventListener.java          # Listens to Kafka events
└── model/
    └── Notification.java
```

### Analytics Service (Port: 8097)

**Location**: `analytics-service/`

#### File Structure:

```
src/main/java/com/example/analyticsservice/
├── AnalyticsServiceApplication.java
├── controller/
│   └── AnalyticsController.java
├── service/
│   └── AnalyticsService.java
└── model/
    └── Analytics.java
```

---

## Request Flow Layers

### Layer 1: Client (Angular Frontend)

**Location**: `enterprise-dashboard/src/app/`

```
Component Layer
     ↓
Service Layer (HTTP Client)
     ↓
Proxy Config (proxy.conf.json)
```

### Layer 2: API Gateway

```
Request arrives at http://localhost:8080/api/...
     ↓
JWT Token Validation
     ↓
CORS Headers Applied
     ↓
Route to appropriate microservice
```

### Layer 3: Microservice

```
Controller Layer (@RestController)
     ↓
Service Layer (@Service) - Business Logic
     ↓
Repository Layer (@Repository) - Data Access
     ↓
MongoDB
```

---

## Service Communication Pattern

### Synchronous Communication (RestTemplate)

```java
// Example: Booking Service → Hotel Service
@Service
public class BookingService {
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String HOTEL_SERVICE_URL = "http://localhost:8092/api/hotels";

    public void enrichBookingResponse(BookingResponse response) {
        // Call Hotel Service
        Map<String, Object> hotel = restTemplate.getForObject(
            HOTEL_SERVICE_URL + "/" + response.getHotelId(),
            Map.class
        );
        response.setHotelName(hotel.get("name"));
    }
}
```

### Asynchronous Communication (Kafka)

```java
// Example: Booking Service publishes event
@Service
public class BookingService {
    @Autowired
    private KafkaTemplate<String, BookingEvent> kafkaTemplate;

    public void publishBookingCreated(Booking booking) {
        kafkaTemplate.send("booking-events", new BookingEvent(booking));
    }
}

// Notification Service listens
@Service
public class KafkaEventListener {
    @KafkaListener(topics = "booking-events")
    public void handleBookingEvent(BookingEvent event) {
        // Send notification
    }
}
```

---

## Authentication Flow

### Registration Flow

```
1. User fills registration form
        ↓
2. Angular → POST /api/users/register
        ↓
3. API Gateway → User Service
        ↓
4. UserController.register()
        ↓
5. UserService.register()
   - Validate input
   - Check if email exists
   - Hash password (BCrypt)
   - Set default role (USER)
   - Save to MongoDB
        ↓
6. Generate JWT Token
        ↓
7. Return LoginResponse with token
        ↓
8. Angular stores token in localStorage
```

### Login Flow

```
1. User enters credentials
        ↓
2. Angular → POST /api/users/login
        ↓
3. API Gateway → User Service
        ↓
4. UserController.login()
        ↓
5. UserService.login()
   - Find user by email
   - Verify password (BCrypt)
   - Generate JWT token
        ↓
6. Return LoginResponse
        ↓
7. Angular stores token & user data
        ↓
8. Navigate to /hotels
```

### Authenticated Request Flow

```
1. Angular adds token to headers
   Authorization: Bearer <token>
        ↓
2. API Gateway validates JWT
        ↓
3. Extract userId from token
        ↓
4. Forward to microservice with userId
        ↓
5. Microservice processes request
```

---

## Booking Creation Flow

### Complete End-to-End Flow

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Angular)                                          │
├─────────────────────────────────────────────────────────────┤
│ 1. User selects hotel & room                                │
│ 2. Fills booking form (dates, guests)                       │
│ 3. Clicks "Book Now"                                        │
│ 4. BookingService.createBooking()                           │
│    POST /api/bookings                                       │
│    Headers: { Authorization: Bearer <token> }               │
│    Body: { hotelId, roomId, checkIn, checkOut, ... }        │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ API GATEWAY (Port 8080)                                     │
├─────────────────────────────────────────────────────────────┤
│ 1. Receive request at /api/bookings                         │
│ 2. Validate JWT token                                       │
│ 3. Extract userId from token                                │
│ 4. Route to BOOKING-SERVICE                                 │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ BOOKING SERVICE (Port 8093)                                 │
├─────────────────────────────────────────────────────────────┤
│ BookingController.createBooking()                           │
│         ↓                                                    │
│ BookingService.createBooking()                              │
│         ↓                                                    │
│ Create Booking entity                                       │
│ Set initial status: PENDING                                 │
│         ↓                                                    │
│ BookingSagaOrchestrator.execute()                           │
│                                                              │
│ ┌────────────────────────────────────────────────┐          │
│ │ SAGA STEP 1: ValidateBookingStep              │          │
│ │ - Validate check-in < check-out                │          │
│ │ - Validate guest count > 0                     │          │
│ │ - Validate dates are future                    │          │
│ │ Result: Pass/Fail                              │          │
│ └────────────────────────────────────────────────┘          │
│         ↓                                                    │
│ ┌────────────────────────────────────────────────┐          │
│ │ SAGA STEP 2: HoldRoomStep                     │          │
│ │ RestTemplate call to Hotel Service:            │          │
│ │ POST http://localhost:8092/api/hotels/{id}/    │          │
│ │      rooms/{roomId}/hold                       │          │
│ │ - Check room availability                      │          │
│ │ - Reserve the room                             │          │
│ │ Result: Room held/unavailable                  │          │
│ └────────────────────────────────────────────────┘          │
│         ↓                                                    │
│ ┌────────────────────────────────────────────────┐          │
│ │ SAGA STEP 3: ProcessPaymentStep               │          │
│ │ Check payment method:                          │          │
│ │ - If MOCK: Set status = CONFIRMED              │          │
│ │   Generate paymentId = "MOCK-{timestamp}"      │          │
│ │ - If REAL: Set status = PAYMENT_PENDING        │          │
│ │   Integrate with payment gateway               │          │
│ └────────────────────────────────────────────────┘          │
│         ↓                                                    │
│ ┌────────────────────────────────────────────────┐          │
│ │ SAGA STEP 4: ConfirmBookingStep               │          │
│ │ - Save booking to MongoDB                      │          │
│ │ - Set createdAt timestamp                      │          │
│ │ - Set expiresAt (for pending bookings)         │          │
│ │ - Publish Kafka event: "booking-created"       │          │
│ └────────────────────────────────────────────────┘          │
│         ↓                                                    │
│ BookingService.enrichBookingResponse()                      │
│         ↓                                                    │
│ ┌────────────────────────────────────────────────┐          │
│ │ ENRICHMENT PROCESS                             │          │
│ │ RestTemplate call to Hotel Service:            │          │
│ │ GET http://localhost:8092/api/hotels/{id}      │          │
│ │ → Extract hotelName                            │          │
│ │                                                 │          │
│ │ GET http://localhost:8092/api/hotels/{id}/     │          │
│ │     rooms/{roomId}                             │          │
│ │ → Extract roomType, roomNumber                 │          │
│ │                                                 │          │
│ │ Calculate paymentStatus:                       │          │
│ │ - Has paymentId? → "PAID"                      │          │
│ │ - Status PAYMENT_PENDING? → "PENDING"          │          │
│ │ - Otherwise → "UNPAID"                         │          │
│ └────────────────────────────────────────────────┘          │
│         ↓                                                    │
│ Return BookingResponse                                      │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ HOTEL SERVICE (Port 8092)                                   │
├─────────────────────────────────────────────────────────────┤
│ Handles room availability & reservation                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ KAFKA MESSAGE BUS                                           │
├─────────────────────────────────────────────────────────────┤
│ Topic: "booking-events"                                     │
│ Event: BookingCreatedEvent                                  │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ NOTIFICATION SERVICE (Port 8096)                            │
├─────────────────────────────────────────────────────────────┤
│ @KafkaListener receives event                               │
│ Send booking confirmation email/notification                │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Angular)                                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Receive BookingResponse                                  │
│ 2. Show success modal                                       │
│ 3. Display booking details with:                            │
│    - Hotel name                                             │
│    - Room type & number                                     │
│    - Payment status (PAID/CONFIRMED)                        │
│ 4. Navigate to booking confirmation page                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Common Module (Shared Utilities)

**Location**: `common/`

```
src/main/java/com/example/common/
├── util/
│   └── JwtUtil.java                     # JWT generation & validation
├── filter/
│   └── JwtAuthenticationFilter.java     # Request filter for JWT
└── config/
    └── SecurityConfig.java              # Shared security config
```

**Used by**: All microservices that require JWT authentication

---

## Key Design Patterns Used

### 1. Saga Pattern (Booking Service)

- **Purpose**: Manage distributed transactions
- **Implementation**: Sequential steps with rollback capability
- **Files**: `saga/` directory in booking-service

### 2. DTO Pattern

- **Purpose**: Separate API contracts from domain models
- **Implementation**: Request/Response DTOs in each service
- **Files**: `dto/` directory in each service

### 3. Repository Pattern

- **Purpose**: Abstract data access layer
- **Implementation**: Spring Data MongoDB repositories
- **Files**: `repository/` directory in each service

### 4. Service Layer Pattern

- **Purpose**: Encapsulate business logic
- **Implementation**: @Service annotated classes
- **Files**: `service/` directory in each service

### 5. API Gateway Pattern

- **Purpose**: Single entry point for all clients
- **Implementation**: Spring Cloud Gateway
- **Files**: `api-gateway/`

---

## Database Schema (MongoDB Collections)

### Users Collection

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (BCrypt hashed),
  firstName: String,
  lastName: String,
  phone: String,
  role: String (USER/ADMIN),
  createdAt: Date
}
```

### Hotels Collection

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  amenities: [String],
  rating: Number,
  images: [String],
  createdAt: Date
}
```

### Rooms Collection

```javascript
{
  _id: ObjectId,
  hotelId: String,
  roomNumber: String,
  type: String,
  price: Number,
  capacity: Number,
  amenities: [String],
  available: Boolean,
  images: [String]
}
```

### Bookings Collection

```javascript
{
  _id: ObjectId,
  userId: String,
  hotelId: String,
  roomId: String,
  checkInDate: Date,
  checkOutDate: Date,
  guests: Number,
  totalAmount: Number,
  status: String (PENDING/CONFIRMED/CANCELLED),
  paymentId: String,
  paymentMethod: String,
  createdAt: Date,
  expiresAt: Date
}
```

### Payments Collection

```javascript
{
  _id: ObjectId,
  bookingId: String,
  userId: String,
  amount: Number,
  method: String,
  status: String,
  transactionId: String,
  createdAt: Date
}
```

---

## Configuration Files

### Application Properties (Each Service)

```properties
# Server Configuration
server.port=809X

# MongoDB Configuration
spring.data.mongodb.uri=mongodb://localhost:27017/hotel-db

# Eureka Client Configuration
eureka.client.service-url.defaultZone=http://localhost:8761/eureka
eureka.instance.prefer-ip-address=true

# Kafka Configuration
spring.kafka.bootstrap-servers=localhost:9092
```

### Proxy Configuration (Angular)

**File**: `enterprise-dashboard/proxy.conf.json`

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

---

## Error Handling Flow

```
Exception occurs in Service Layer
        ↓
Caught by @ControllerAdvice
        ↓
Converted to appropriate HTTP status
        ↓
Error response sent to client
        ↓
Angular displays error message
```

---

## Logging Strategy

Each layer logs different information:

1. **Controller Layer**: Request/Response logging
2. **Service Layer**: Business logic decisions
3. **Repository Layer**: Database operations
4. **Saga Steps**: Transaction progress

---

## Security Flow

```
JWT Token Structure:
{
  "sub": "user@email.com",
  "userId": "123456",
  "role": "USER",
  "iat": 1234567890,
  "exp": 1234567890
}

Token Validation:
1. Extract from Authorization header
2. Verify signature
3. Check expiration
4. Extract user details
5. Set SecurityContext
```

---

## Deployment Architecture

```
┌──────────────────┐
│  Load Balancer   │
└────────┬─────────┘
         │
┌────────▼─────────┐
│   API Gateway    │ (Port 8080)
└────────┬─────────┘
         │
    ┌────┴────┬────────┬──────────┬─────────┬──────────┐
    │         │        │          │         │          │
┌───▼───┐ ┌──▼──┐ ┌───▼────┐ ┌──▼───┐ ┌───▼────┐ ┌──▼──┐
│ User  │ │Hotel│ │Booking │ │Payment│ │Review  │ │...  │
│Service│ │Svc  │ │Service │ │Service│ │Service │ │     │
└───┬───┘ └──┬──┘ └───┬────┘ └──┬───┘ └───┬────┘ └─────┘
    │        │        │         │         │
    └────────┴────────┴─────────┴─────────┘
                     │
              ┌──────▼──────┐
              │   MongoDB   │
              └─────────────┘
```

---

## Common Module Integration

The `common` module provides shared utilities:

```java
// JWT Utility (used by all services)
@Component
public class JwtUtil {
    public String generateToken(String email, String userId, String role) { }
    public Claims extractClaims(String token) { }
    public boolean validateToken(String token) { }
}

// Used in services like:
@Service
public class UserService {
    @Autowired
    private JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        // Authenticate user
        String token = jwtUtil.generateToken(user.getEmail(),
                                            user.getId(),
                                            user.getRole());
        return new LoginResponse(token, user);
    }
}
```

---

## Summary

This hotel management system follows a **microservices architecture** with clear separation of concerns:

1. **Presentation Layer**: Angular components
2. **API Layer**: Controllers with REST endpoints
3. **Business Logic Layer**: Service classes
4. **Data Access Layer**: Repository interfaces
5. **Database Layer**: MongoDB collections

Each request flows through multiple layers with proper validation, authentication, and error handling at each stage. The saga pattern ensures data consistency across distributed services, while Kafka enables asynchronous event-driven communication.
