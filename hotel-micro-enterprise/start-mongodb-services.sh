#!/bin/bash

echo "================================================================"
echo "    Starting Hotel Management Microservices with MongoDB"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo -e "${YELLOW}Checking MongoDB...${NC}"
if docker ps | grep -q hotel-mongodb; then
    echo -e "${GREEN}✅ MongoDB is running${NC}"
else
    echo -e "${RED}❌ MongoDB is not running. Starting MongoDB...${NC}"
    docker run -d --name hotel-mongodb -p 27017:27017 mongo:7.0
    sleep 5
    echo -e "${GREEN}✅ MongoDB started${NC}"
fi
echo ""

# Function to wait for a service
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_attempts=30
    local attempt=0
    
    echo -e "${YELLOW}Waiting for $service_name on port $port...${NC}"
    while [ $attempt -lt $max_attempts ]; do
        if nc -z localhost $port 2>/dev/null; then
            echo -e "${GREEN}✅ $service_name is ready${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    echo -e "${RED}❌ $service_name failed to start${NC}"
    return 1
}

# Get the base directory
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start Service Registry (Eureka)
echo -e "${YELLOW}Starting Service Registry (Eureka)...${NC}"
cd "$BASE_DIR/service-registry"
mvn spring-boot:run > /tmp/service-registry.log 2>&1 &
wait_for_service 8761 "Service Registry"
echo ""

# Start API Gateway
echo -e "${YELLOW}Starting API Gateway...${NC}"
cd "$BASE_DIR/api-gateway"
mvn spring-boot:run > /tmp/api-gateway.log 2>&1 &
wait_for_service 8080 "API Gateway"
echo ""

# Start User Service
echo -e "${YELLOW}Starting User Service...${NC}"
cd "$BASE_DIR/user-service"
mvn spring-boot:run > /tmp/user-service.log 2>&1 &
wait_for_service 8091 "User Service"
echo ""

# Start Hotel Service
echo -e "${YELLOW}Starting Hotel Service...${NC}"
cd "$BASE_DIR/hotel-service"
mvn spring-boot:run > /tmp/hotel-service.log 2>&1 &
wait_for_service 8092 "Hotel Service"
echo ""

# Start Booking Service
echo -e "${YELLOW}Starting Booking Service...${NC}"
cd "$BASE_DIR/booking-service"
mvn spring-boot:run > /tmp/booking-service.log 2>&1 &
wait_for_service 8093 "Booking Service"
echo ""

# Start Payment Service
echo -e "${YELLOW}Starting Payment Service...${NC}"
cd "$BASE_DIR/payment-service"
mvn spring-boot:run > /tmp/payment-service.log 2>&1 &
wait_for_service 8094 "Payment Service"
echo ""

# Start Review Service
echo -e "${YELLOW}Starting Review Service...${NC}"
cd "$BASE_DIR/review-service"
mvn spring-boot:run > /tmp/review-service.log 2>&1 &
wait_for_service 8095 "Review Service"
echo ""

# Start Notification Service
echo -e "${YELLOW}Starting Notification Service...${NC}"
cd "$BASE_DIR/notification-service"
mvn spring-boot:run > /tmp/notification-service.log 2>&1 &
wait_for_service 8096 "Notification Service"
echo ""

# Start Analytics Service
echo -e "${YELLOW}Starting Analytics Service...${NC}"
cd "$BASE_DIR/analytics-service"
mvn spring-boot:run > /tmp/analytics-service.log 2>&1 &
wait_for_service 8097 "Analytics Service"
echo ""

echo "================================================================"
echo -e "${GREEN}✅ All Services Started Successfully!${NC}"
echo "================================================================"
echo ""
echo "Service URLs:"
echo "  - Service Registry (Eureka): http://localhost:8761"
echo "  - API Gateway:               http://localhost:8080"
echo "  - User Service:              http://localhost:8091"
echo "  - Hotel Service:             http://localhost:8092"
echo "  - Booking Service:           http://localhost:8093"
echo "  - Payment Service:           http://localhost:8094"
echo "  - Review Service:            http://localhost:8095"
echo "  - Notification Service:      http://localhost:8096"
echo "  - Analytics Service:         http://localhost:8097"
echo ""
echo "MongoDB:"
echo "  - Connection:                mongodb://localhost:27017"
echo ""
echo "Logs are available in /tmp/[service-name].log"
echo ""
echo "To stop all services, run: ./stop-all-services.sh"
echo "================================================================"
