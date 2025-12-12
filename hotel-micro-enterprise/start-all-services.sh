#!/bin/bash

BASE_DIR="/Users/yn00000/Library/CloudStorage/OneDrive-BlackhawkNetwork,Inc/Desktop/HotelManagement/hotel-micro-enterprise"

echo "=== Starting All Microservices ==="
echo ""

# Kill existing services
echo "Stopping any existing services..."
lsof -ti:8761,8080,8091,8092,8093,8094,8095,8096,8097,4200 | xargs kill -9 2>/dev/null
sleep 2

# 1. Service Registry (Eureka)
echo "1. Starting Service Registry (Port 8761)..."
cd "$BASE_DIR/service-registry"
mvn spring-boot:run > /tmp/service-registry.log 2>&1 &
echo "   PID: $!"
sleep 15

# 2. API Gateway
echo "2. Starting API Gateway (Port 8080)..."
cd "$BASE_DIR/api-gateway"
mvn spring-boot:run > /tmp/api-gateway.log 2>&1 &
echo "   PID: $!"
sleep 10

# 3. User Service
echo "3. Starting User Service (Port 8091)..."
cd "$BASE_DIR/user-service"
mvn spring-boot:run > /tmp/user-service.log 2>&1 &
echo "   PID: $!"
sleep 8

# 4. Hotel Service
echo "4. Starting Hotel Service (Port 8092)..."
cd "$BASE_DIR/hotel-service"
mvn spring-boot:run > /tmp/hotel-service.log 2>&1 &
echo "   PID: $!"
sleep 8

# 5. Booking Service
echo "5. Starting Booking Service (Port 8093)..."
cd "$BASE_DIR/booking-service"
mvn spring-boot:run > /tmp/booking-service.log 2>&1 &
echo "   PID: $!"
sleep 8

# 6. Payment Service
echo "6. Starting Payment Service (Port 8094)..."
cd "$BASE_DIR/payment-service"
mvn spring-boot:run > /tmp/payment-service.log 2>&1 &
echo "   PID: $!"
sleep 8

# 7. Review Service
echo "7. Starting Review Service (Port 8095)..."
cd "$BASE_DIR/review-service"
mvn spring-boot:run > /tmp/review-service.log 2>&1 &
echo "   PID: $!"
sleep 8

# 8. Notification Service
echo "8. Starting Notification Service (Port 8096)..."
cd "$BASE_DIR/notification-service"
mvn spring-boot:run > /tmp/notification-service.log 2>&1 &
echo "   PID: $!"
sleep 8

# 9. Analytics Service
echo "9. Starting Analytics Service (Port 8097)..."
cd "$BASE_DIR/analytics-service"
mvn spring-boot:run > /tmp/analytics-service.log 2>&1 &
echo "   PID: $!"
sleep 8

# 10. Angular Frontend
echo "10. Starting Angular Frontend (Port 4200)..."
cd "$BASE_DIR/../enterprise-dashboard"
ng serve --port 4200 --proxy-config proxy.conf.json > /tmp/angular.log 2>&1 &
echo "   PID: $!"

echo ""
echo "=== All Services Started ==="
echo ""
echo "Wait 30 seconds for all services to register with Eureka..."
sleep 30

echo ""
echo "=== Service Status ==="
lsof -i:8761 | grep LISTEN && echo "✓ Service Registry (8761)"
lsof -i:8080 | grep LISTEN && echo "✓ API Gateway (8080)"
lsof -i:8091 | grep LISTEN && echo "✓ User Service (8091)"
lsof -i:8092 | grep LISTEN && echo "✓ Hotel Service (8092)"
lsof -i:8093 | grep LISTEN && echo "✓ Booking Service (8093)"
lsof -i:8094 | grep LISTEN && echo "✓ Payment Service (8094)"
lsof -i:8095 | grep LISTEN && echo "✓ Review Service (8095)"
lsof -i:8096 | grep LISTEN && echo "✓ Notification Service (8096)"
lsof -i:8097 | grep LISTEN && echo "✓ Analytics Service (8097)"
lsof -i:4200 | grep LISTEN && echo "✓ Angular Frontend (4200)"

echo ""
echo "Access Application: http://localhost:4200"
echo "Access Eureka Dashboard: http://localhost:8761"
echo ""
echo "Logs are in /tmp directory:"
echo "  - Service Registry: /tmp/service-registry.log"
echo "  - API Gateway: /tmp/api-gateway.log"
echo "  - User Service: /tmp/user-service.log"
echo "  - Hotel Service: /tmp/hotel-service.log"
echo "  - Booking Service: /tmp/booking-service.log"
echo "  - Payment Service: /tmp/payment-service.log"
echo "  - Review Service: /tmp/review-service.log"
echo "  - Notification Service: /tmp/notification-service.log"
echo "  - Analytics Service: /tmp/analytics-service.log"
echo "  - Angular: /tmp/angular.log"
