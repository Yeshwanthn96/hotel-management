#!/bin/bash

echo "================================================================"
echo "    Stopping All Hotel Management Services"
echo "================================================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Kill all Java processes running our services
echo "Stopping all services..."
pkill -f "spring-boot:run"
pkill -f "hotel-micro-enterprise"

sleep 3

echo -e "${GREEN}✅ All services stopped${NC}"
echo ""
echo "MongoDB is still running. To stop MongoDB:"
echo "  docker stop hotel-mongodb"
echo "  docker rm hotel-mongodb"
echo "================================================================"
