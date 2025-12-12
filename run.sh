#!/bin/bash
# Cross-platform Hotel Management Application Runner
# Works on Mac (bash/zsh) and Windows (Git Bash)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/hotel-micro-enterprise"
FRONTEND_DIR="$SCRIPT_DIR/enterprise-dashboard"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_banner() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║           HOTEL MANAGEMENT SYSTEM                          ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check Java
    if ! command -v java &> /dev/null; then
        echo -e "${RED}✗ Java not found. Please install Java 17+${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Java found${NC}"
    
    # Check Maven
    if ! command -v mvn &> /dev/null; then
        echo -e "${RED}✗ Maven not found. Please install Maven 3.6+${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Maven found${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Node.js found${NC}"
    
    # Check Docker (for MongoDB)
    if ! command -v docker &> /dev/null; then
        echo -e "${YELLOW}⚠ Docker not found. MongoDB must be running separately.${NC}"
    else
        echo -e "${GREEN}✓ Docker found${NC}"
    fi
}

start_mongodb() {
    echo -e "${YELLOW}Starting MongoDB...${NC}"
    
    if command -v docker &> /dev/null; then
        # Check if MongoDB container exists
        if docker ps -a --format '{{.Names}}' | grep -q "hotel-mongodb"; then
            # Start existing container
            docker start hotel-mongodb 2>/dev/null || true
        else
            # Create new container
            docker run -d --name hotel-mongodb -p 27017:27017 mongo:7.0
        fi
        
        # Wait for MongoDB to be ready
        sleep 3
        echo -e "${GREEN}✓ MongoDB started on port 27017${NC}"
    else
        echo -e "${YELLOW}⚠ Please ensure MongoDB is running on port 27017${NC}"
    fi
}

start_backend() {
    echo -e "${YELLOW}Starting Backend Services...${NC}"
    
    cd "$BACKEND_DIR"
    
    # Build common module first
    echo -e "${BLUE}Building common module...${NC}"
    cd common && mvn clean install -DskipTests -q && cd ..
    
    # Services to start in order
    services=("service-registry:8761" "api-gateway:8080" "user-service:8091" "hotel-service:8092" "booking-service:8093" "payment-service:8094" "review-service:8095" "notification-service:8096" "analytics-service:8097")
    
    for service_info in "${services[@]}"; do
        service="${service_info%%:*}"
        port="${service_info##*:}"
        
        echo -e "${BLUE}Starting $service on port $port...${NC}"
        cd "$BACKEND_DIR/$service"
        mvn spring-boot:run -DskipTests -q &
        
        # Wait for service to start
        if [ "$service" = "service-registry" ]; then
            sleep 10
        elif [ "$service" = "api-gateway" ]; then
            sleep 8
        else
            sleep 3
        fi
    done
    
    echo -e "${GREEN}✓ All backend services started${NC}"
}

start_frontend() {
    echo -e "${YELLOW}Starting Frontend...${NC}"
    
    cd "$FRONTEND_DIR"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}Installing npm dependencies...${NC}"
        npm install
    fi
    
    # Start Angular
    echo -e "${BLUE}Starting Angular on port 4200...${NC}"
    npm start &
    
    sleep 5
    echo -e "${GREEN}✓ Frontend started on http://localhost:4200${NC}"
}

stop_all() {
    echo -e "${YELLOW}Stopping all services...${NC}"
    
    # Kill processes on known ports
    for port in 4200 8080 8761 8091 8092 8093 8094 8095 8096 8097; do
        if command -v lsof &> /dev/null; then
            lsof -ti:$port 2>/dev/null | xargs kill -9 2>/dev/null || true
        elif command -v netstat &> /dev/null; then
            # Windows Git Bash
            netstat -ano | grep ":$port " | awk '{print $5}' | xargs taskkill //PID //F 2>/dev/null || true
        fi
    done
    
    # Stop MongoDB container
    if command -v docker &> /dev/null; then
        docker stop hotel-mongodb 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✓ All services stopped${NC}"
}

show_status() {
    echo -e "${YELLOW}Service Status:${NC}"
    echo ""
    
    services=("MongoDB:27017" "Service Registry:8761" "API Gateway:8080" "User Service:8091" "Hotel Service:8092" "Booking Service:8093" "Payment Service:8094" "Review Service:8095" "Notification Service:8096" "Analytics Service:8097" "Angular Frontend:4200")
    
    for service_info in "${services[@]}"; do
        name="${service_info%%:*}"
        port="${service_info##*:}"
        
        if command -v lsof &> /dev/null; then
            if lsof -ti:$port &> /dev/null; then
                echo -e "${GREEN}✓ $name (port $port) - Running${NC}"
            else
                echo -e "${RED}✗ $name (port $port) - Stopped${NC}"
            fi
        elif command -v netstat &> /dev/null; then
            if netstat -an | grep -q ":$port "; then
                echo -e "${GREEN}✓ $name (port $port) - Running${NC}"
            else
                echo -e "${RED}✗ $name (port $port) - Stopped${NC}"
            fi
        fi
    done
}

show_help() {
    echo "Usage: ./run.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start     Start all services (MongoDB, Backend, Frontend)"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  status    Show status of all services"
    echo "  backend   Start only backend services"
    echo "  frontend  Start only frontend"
    echo "  help      Show this help message"
    echo ""
    echo "URLs:"
    echo "  Frontend:         http://localhost:4200"
    echo "  API Gateway:      http://localhost:8080"
    echo "  Service Registry: http://localhost:8761"
}

# Main
print_banner

case "${1:-start}" in
    start)
        check_prerequisites
        start_mongodb
        start_backend
        start_frontend
        echo ""
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  Application Started Successfully!                         ║${NC}"
        echo -e "${GREEN}║  Frontend: http://localhost:4200                           ║${NC}"
        echo -e "${GREEN}║  API:      http://localhost:8080                           ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
        ;;
    stop)
        stop_all
        ;;
    restart)
        stop_all
        sleep 2
        check_prerequisites
        start_mongodb
        start_backend
        start_frontend
        ;;
    status)
        show_status
        ;;
    backend)
        check_prerequisites
        start_mongodb
        start_backend
        ;;
    frontend)
        start_frontend
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
