# MongoDB Atlas Migration Guide

## Current Local Databases

- `hotel_users` → users
- `hotel_catalog` → hotels, rooms
- `hotel_bookings` → bookings
- `hotel_reviews` → reviews
- `hotel_payments` → (empty)
- `hotel_analytics` → (empty)
- `hotel_notifications` → (empty)

## Step 1: Export Data from Local MongoDB (Using VS Code)

1. Open **MongoDB for VS Code** extension
2. Connect to `localhost:27017`
3. For each collection, export to JSON:

### hotel_users database:

```
localhost:27017 → hotel_users → users → Right-click → Export to JSON
Save as: mongodb-export/hotel_users_users.json
```

### hotel_catalog database:

```
localhost:27017 → hotel_catalog → hotels → Right-click → Export to JSON
Save as: mongodb-export/hotel_catalog_hotels.json

localhost:27017 → hotel_catalog → rooms → Right-click → Export to JSON
Save as: mongodb-export/hotel_catalog_rooms.json
```

### hotel_bookings database:

```
localhost:27017 → hotel_bookings → bookings → Right-click → Export to JSON
Save as: mongodb-export/hotel_bookings_bookings.json
```

### hotel_reviews database:

```
localhost:27017 → hotel_reviews → reviews → Right-click → Export to JSON
Save as: mongodb-export/hotel_reviews_reviews.json
```

## Step 2: Import Data to MongoDB Atlas

1. In VS Code MongoDB extension, connect to `hotelmanagement.yzu70xs.mongodb...`
2. Create databases (if they don't exist):

   - hotel_users
   - hotel_catalog
   - hotel_bookings
   - hotel_reviews
   - hotel_payments
   - hotel_analytics
   - hotel_notifications

3. Import collections:

### Import to hotel_users:

```
hotelmanagement.yzu70xs.mongodb... → hotel_users → Right-click → Create Collection → "users"
users → Right-click → Import from JSON → Select mongodb-export/hotel_users_users.json
```

### Import to hotel_catalog:

```
Create "hotels" collection → Import mongodb-export/hotel_catalog_hotels.json
Create "rooms" collection → Import mongodb-export/hotel_catalog_rooms.json
```

### Import to hotel_bookings:

```
Create "bookings" collection → Import mongodb-export/hotel_bookings_bookings.json
```

### Import to hotel_reviews:

```
Create "reviews" collection → Import mongodb-export/hotel_reviews_reviews.json
```

## Step 3: Get Your Atlas Connection String

1. In VS Code, right-click on `hotelmanagement.yzu70xs.mongodb...`
2. Select **"Copy Connection String"**
3. It should look like:

```
mongodb+srv://username:password@hotelmanagement.yzu70xs.mongodb.net/?retryWrites=true&w=majority
```

## Step 4: Update Backend Configuration

### Option A: Using Environment Variable (Recommended)

Set the MONGODB_BASE_URI environment variable:

**macOS/Linux:**

```bash
export MONGODB_BASE_URI="mongodb+srv://username:password@hotelmanagement.yzu70xs.mongodb.net"
```

**Windows (PowerShell):**

```powershell
$env:MONGODB_BASE_URI="mongodb+srv://username:password@hotelmanagement.yzu70xs.mongodb.net"
```

Then run services normally - they will automatically append the database name.

### Option B: Update Each application.yml File

Replace `mongodb://localhost:27017` with your Atlas URI in these files:

- user-service/src/main/resources/application.yml
- hotel-service/src/main/resources/application.yml
- booking-service/src/main/resources/application.yml
- review-service/src/main/resources/application.yml
- payment-service/src/main/resources/application.yml
- analytics-service/src/main/resources/application.yml
- notification-service/src/main/resources/application.yml

## Step 5: Test Connection

1. Stop all running services
2. Start one service to test Atlas connection:

```bash
cd user-service
mvn spring-boot:run
```

3. Check logs for successful MongoDB connection
4. If successful, start all services

## Step 6: Verify Data

Access your application and verify:

- ✅ Users can login
- ✅ Hotels are displayed
- ✅ Bookings show up
- ✅ Reviews are visible

## Troubleshooting

### Connection Issues

- Ensure Atlas IP whitelist includes your IP (or use 0.0.0.0/0 for development)
- Check username/password in connection string
- Verify network access in Atlas dashboard

### Missing Data

- Re-import JSON files
- Check database and collection names match exactly
- Verify JSON files are not empty

## Security Notes

⚠️ **Never commit your Atlas credentials to Git!**

- Use environment variables
- Add `.env` to `.gitignore`
- Use different credentials for production
