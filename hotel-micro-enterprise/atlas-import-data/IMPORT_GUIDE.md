# Atlas Data Import Guide

## ✅ Your data has been exported to:

`atlas-import-data/`

### Files Ready for Import:

- ✅ `users.json` (4 documents) → hotel_users.users
- ✅ `hotels.json` (3 documents) → hotel_catalog.hotels
- ✅ `rooms.json` (6 documents) → hotel_catalog.rooms
- ✅ `bookings.json` (11 documents) → hotel_bookings.bookings
- ✅ `reviews.json` (2 documents) → hotel_reviews.reviews

---

## Option 1: Using VS Code MongoDB Extension (Easiest)

### Step 1: Connect to Atlas

1. In VS Code, open **MongoDB** extension (left sidebar)
2. Click on `hotelmanagement.yzu70xs.mongodb...` to expand

### Step 2: Import Data

**Import Users:**

1. Expand `hotel_users` database (or create it)
2. Right-click on database → **Add Collection** → Name: `users`
3. Right-click `users` collection → **MongoDB: Run Aggregate**
4. Paste this command:
   ```javascript
   db.users.insertMany(<paste contents of users.json here>)
   ```

**Or try the Playground method:**

1. Create new MongoDB Playground (⌘+⇧+P → "MongoDB: Create MongoDB Playground")
2. Paste:

   ```javascript
   use('hotel_users');

   // Copy-paste users.json content array here
   db.users.insertMany([...]);
   ```

---

## Option 2: Using mongoimport (If installed)

```bash
cd atlas-import-data

# Import users
mongoimport --uri="mongodb+srv://hotel_db_user:bpR7axsHo7abot4r@hotelmanagement.yzu70xs.mongodb.net/hotel_users" \
            --collection=users \
            --file=users.json \
            --jsonArray

# Import hotels
mongoimport --uri="mongodb+srv://hotel_db_user:bpR7axsHo7abot4r@hotelmanagement.yzu70xs.mongodb.net/hotel_catalog" \
            --collection=hotels \
            --file=hotels.json \
            --jsonArray

# Import rooms
mongoimport --uri="mongodb+srv://hotel_db_user:bpR7axsHo7abot4r@hotelmanagement.yzu70xs.mongodb.net/hotel_catalog" \
            --collection=rooms \
            --file=rooms.json \
            --jsonArray

# Import bookings
mongoimport --uri="mongodb+srv://hotel_db_user:bpR7axsHo7abot4r@hotelmanagement.yzu70xs.mongodb.net/hotel_bookings" \
            --collection=bookings \
            --file=bookings.json \
            --jsonArray

# Import reviews
mongoimport --uri="mongodb+srv://hotel_db_user:bpR7axsHo7abot4r@hotelmanagement.yzu70xs.mongodb.net/hotel_reviews" \
            --collection=reviews \
            --file=reviews.json \
            --jsonArray
```

---

## Option 3: Manual Copy-Paste (Simplest)

1. Open each JSON file in VS Code
2. Copy the array content (everything between `[` and `]`)
3. In MongoDB extension:
   - Right-click database → Create collection
   - Use MongoDB Playground to run `db.collection.insertMany([<paste here>])`

---

## After Import - Verify:

1. In MongoDB extension, expand Atlas connection
2. Check each database has the correct collections
3. Click on a collection to see documents

**Expected counts:**

- hotel_users.users: 4 documents
- hotel_catalog.hotels: 3 documents
- hotel_catalog.rooms: 6 documents
- hotel_bookings.bookings: 11 documents
- hotel_reviews.reviews: 2 documents

---

## ✅ Backend is Already Configured!

All services are now using MongoDB Atlas:

- user-service → hotel_users
- hotel-service → hotel_catalog
- booking-service → hotel_bookings
- review-service → hotel_reviews
- payment-service → hotel_payments
- analytics-service → hotel_analytics
- notification-service → hotel_notifications

Once you import the data, just restart the services and test!
