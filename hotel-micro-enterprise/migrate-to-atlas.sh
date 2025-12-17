#!/bin/bash

# MongoDB Local to Atlas Migration Script
# This script exports data from local MongoDB and imports to Atlas

ATLAS_URI="mongodb+srv://hotel_db_user:bpR7axsHo7abot4r@hotelmanagement.yzu70xs.mongodb.net"

echo "🔄 MongoDB Migration: Local → Atlas"
echo "===================================="
echo ""

# Create export directory
EXPORT_DIR="./mongodb-migration-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$EXPORT_DIR"

echo "📁 Export directory: $EXPORT_DIR"
echo ""

# Check if mongodump is available
if command -v mongodump &> /dev/null; then
    echo "✅ mongodump found - using native MongoDB tools"
    echo ""
    
    # Export from local MongoDB
    echo "📤 Exporting from localhost:27017..."
    
    mongodump --uri="mongodb://localhost:27017" \
              --db=hotel_users \
              --out="$EXPORT_DIR"
    
    mongodump --uri="mongodb://localhost:27017" \
              --db=hotel_catalog \
              --out="$EXPORT_DIR"
    
    mongodump --uri="mongodb://localhost:27017" \
              --db=hotel_bookings \
              --out="$EXPORT_DIR"
    
    mongodump --uri="mongodb://localhost:27017" \
              --db=hotel_reviews \
              --out="$EXPORT_DIR"
    
    echo ""
    echo "✅ Export complete!"
    echo ""
    
    # Import to Atlas
    echo "📥 Importing to Atlas..."
    echo ""
    
    mongorestore --uri="$ATLAS_URI" \
                 --dir="$EXPORT_DIR" \
                 --nsInclude='hotel_*.*' \
                 --drop
    
    echo ""
    echo "✅ Migration complete!"
    
else
    echo "❌ mongodump/mongorestore not found"
    echo ""
    echo "Please install MongoDB Database Tools:"
    echo "  macOS:   brew install mongodb-database-tools"
    echo "  Ubuntu:  sudo apt-get install mongodb-database-tools"
    echo "  Windows: Download from https://www.mongodb.com/try/download/database-tools"
    echo ""
    echo "Alternative: Use the manual method below"
    echo ""
fi

echo ""
echo "📊 Migration Summary:"
echo "   Source: mongodb://localhost:27017"
echo "   Target: $ATLAS_URI"
echo "   Databases: hotel_users, hotel_catalog, hotel_bookings, hotel_reviews"
echo ""
echo "🔍 Next Steps:"
echo "1. Verify data in Atlas using VS Code MongoDB extension"
echo "2. Start all microservices"
echo "3. Test the application"
echo ""
