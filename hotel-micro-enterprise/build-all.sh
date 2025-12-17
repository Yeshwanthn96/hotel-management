#!/bin/bash

echo "Building all services..."

cd "/Users/yn00000/Library/CloudStorage/OneDrive-BlackhawkNetwork,Inc/Desktop/HotelManagement/hotel-micro-enterprise"

# Build all services
mvn clean package -DskipTests

# Repackage each service individually
for service in service-registry api-gateway user-service hotel-service booking-service payment-service notification-service review-service analytics-service
do
    echo "Repackaging $service..."
    cd "$service"
    mvn spring-boot:repackage -DskipTests
    cd ..
done

echo "Build complete!"
