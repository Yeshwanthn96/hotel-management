# Hotel Management System

A microservices-based hotel management application.

## Prerequisites

- Java 17+
- Maven 3.6+
- Node.js 18+
- Docker (for MongoDB)

## Quick Start

```bash
# Start everything
./run.sh start

# Stop everything
./run.sh stop

# Check status
./run.sh status
```

## URLs

| Service          | URL                   |
| ---------------- | --------------------- |
| Frontend         | http://localhost:4200 |
| API Gateway      | http://localhost:8080 |
| Service Registry | http://localhost:8761 |

## Project Structure

```
├── enterprise-dashboard/    # Angular Frontend
└── hotel-micro-enterprise/  # Spring Boot Backend
    ├── api-gateway/
    ├── service-registry/
    ├── user-service/
    ├── hotel-service/
    ├── booking-service/
    ├── payment-service/
    ├── review-service/
    ├── notification-service/
    └── analytics-service/
```

## Features

- User & Admin authentication
- Hotel management
- Room bookings
- Payments
- Reviews
- Notifications
