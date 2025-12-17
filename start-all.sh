#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Hotel Management System...${NC}\n"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/hotel-micro-enterprise"
FRONTEND_DIR="$SCRIPT_DIR/enterprise-dashboard"

# MongoDB is already running on Atlas (public cloud)
echo -e "${GREEN}✓ MongoDB Atlas is already configured${NC}"

# Create logs directory
mkdir -p "$BACKEND_DIR/logs"

# Start backend services
echo -e "\n${BLUE}Starting Backend Services...${NC}"
cd "$BACKEND_DIR"

# Start services in order with mvn spring-boot:run
for service in service-registry api-gateway user-service hotel-service booking-service payment-service notification-service review-service analytics-service; do
    echo -e "${GREEN}Starting $service...${NC}"
    (cd "$service" && mvn -q spring-boot:run > "../logs/$service.log" 2>&1) &
    
    # Wait longer for service-registry and api-gateway
    if [ "$service" = "service-registry" ]; then
        sleep 15
    elif [ "$service" = "api-gateway" ]; then
        sleep 10
    else
        sleep 3
    fi
done

echo -e "\n${BLUE}Waiting for services to initialize...${NC}"
sleep 10

# Start frontend
echo -e "\n${BLUE}Starting Frontend (Angular)...${NC}"
cd "$FRONTEND_DIR"
(ng serve > "$BACKEND_DIR/logs/frontend.log" 2>&1) &

sleep 5

echo -e "\n${GREEN}✓ All services started!${NC}\n"
echo -e "${BLUE}Services:${NC}"
echo -e "  - Service Registry: http://localhost:8761"
echo -e "  - API Gateway: http://localhost:8080"
echo -e "  - User Service: http://localhost:8091"
echo -e "  - Hotel Service: http://localhost:8092"
echo -e "  - Booking Service: http://localhost:8093"
echo -e "  - Payment Service: http://localhost:8094"
echo -e "  - Notification Service: http://localhost:8095"
echo -e "  - Review Service: http://localhost:8096"
echo -e "  - Analytics Service: http://localhost:8097"
echo -e "  - Frontend: http://localhost:4200"
echo -e "\n${BLUE}Logs are in: $BACKEND_DIR/logs/${NC}\n"
echo -e "${GREEN}Admin Login: admin@hotel.com / password123${NC}\n"
echo -e "${BLUE}To stop all services, run: ./stop-all.sh${NC}\n"
