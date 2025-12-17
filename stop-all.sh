#!/bin/bash

# Colors for output
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${RED}🛑 Stopping all Hotel Management System services...${NC}\n"

# Stop all Java processes (backend services)
echo -e "Stopping backend services..."
pgrep -f 'java.*jar|spring-boot:run' | xargs kill -9 2>/dev/null

# Stop Angular frontend
echo -e "Stopping frontend..."
lsof -ti:4200 | xargs kill -9 2>/dev/null

echo -e "\n${RED}✓ All services stopped!${NC}\n"
