#!/bin/bash

# MongoDB Atlas Configuration Script
# This script helps configure all microservices to use MongoDB Atlas

echo "🔧 MongoDB Atlas Configuration Helper"
echo "======================================"
echo ""

# Check if connection string is provided
if [ -z "$1" ]; then
    echo "❌ Error: MongoDB Atlas connection string required"
    echo ""
    echo "Usage: ./configure-atlas.sh <your-atlas-connection-string>"
    echo ""
    echo "Example:"
    echo "./configure-atlas.sh 'mongodb+srv://user:pass@cluster.mongodb.net'"
    echo ""
    echo "To get your connection string:"
    echo "1. Open VS Code MongoDB extension"
    echo "2. Right-click on your Atlas connection"
    echo "3. Select 'Copy Connection String'"
    echo "4. Paste it as the first argument to this script"
    exit 1
fi

ATLAS_BASE_URI="$1"

echo "📋 Connection String: ${ATLAS_BASE_URI:0:30}..." 
echo ""
echo "🗄️  This will update MongoDB URIs for:"
echo "   - user-service       → ${ATLAS_BASE_URI}/hotel_users"
echo "   - hotel-service      → ${ATLAS_BASE_URI}/hotel_catalog"
echo "   - booking-service    → ${ATLAS_BASE_URI}/hotel_bookings"
echo "   - review-service     → ${ATLAS_BASE_URI}/hotel_reviews"
echo "   - payment-service    → ${ATLAS_BASE_URI}/hotel_payments"
echo "   - analytics-service  → ${ATLAS_BASE_URI}/hotel_analytics"
echo "   - notification-service → ${ATLAS_BASE_URI}/hotel_notifications"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "🔄 Updating application.yml files..."

# Function to update MongoDB URI in application.yml
update_mongo_uri() {
    local service=$1
    local database=$2
    local file="${service}/src/main/resources/application.yml"
    
    if [ -f "$file" ]; then
        # Backup original file
        cp "$file" "${file}.backup"
        
        # Update MongoDB URI
        sed -i.tmp "s|uri:.*mongodb://localhost:27017/${database}|uri: \${MONGODB_URI:${ATLAS_BASE_URI}/${database}}|g" "$file"
        rm -f "${file}.tmp"
        
        echo "   ✅ Updated $service"
    else
        echo "   ⚠️  Warning: $file not found"
    fi
}

# Update each service
update_mongo_uri "user-service" "hotel_users"
update_mongo_uri "hotel-service" "hotel_catalog"
update_mongo_uri "booking-service" "hotel_bookings"
update_mongo_uri "review-service" "hotel_reviews"
update_mongo_uri "payment-service" "hotel_payments"
update_mongo_uri "analytics-service" "hotel_analytics"
update_mongo_uri "notification-service" "hotel_notifications"

echo ""
echo "✅ Configuration complete!"
echo ""
echo "📝 Backup files created with .backup extension"
echo "💡 To revert: rm */src/main/resources/application.yml && mv */src/main/resources/application.yml.backup */src/main/resources/application.yml"
echo ""
echo "🚀 Next steps:"
echo "1. Verify the connection strings in application.yml files"
echo "2. Export data from local MongoDB (see ATLAS_MIGRATION.md)"
echo "3. Import data to Atlas"
echo "4. Restart all services"
echo ""
