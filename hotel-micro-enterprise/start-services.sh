#!/bin/bash
# Start all services in background

echo "Starting Service Registry..."
java -Xmx128m -jar service-registry.jar --server.port=8761 &
sleep 15

echo "Starting User Service..."
java -Xmx128m -jar user-service.jar --server.port=8091 &
sleep 5

echo "Starting Hotel Service..."
java -Xmx128m -jar hotel-service.jar --server.port=8092 &
sleep 5

echo "Starting Booking Service..."
java -Xmx128m -jar booking-service.jar --server.port=8093 &
sleep 5

echo "Starting Payment Service..."
java -Xmx128m -jar payment-service.jar --server.port=8094 &
sleep 5

echo "Starting API Gateway..."
java -Xmx128m -jar api-gateway.jar --server.port=8080

# Keep container running
wait
