# Bulk Notification System - Demo Guide

## Overview

The notification system allows administrators to send bulk notifications to all users in the system. Users can view their notifications in real-time with unread counts and mark them as read.

## Features Implemented

### 1. Admin Bulk Notification (Admin View)

- **Location**: NOTIFICATIONS menu (admin only)
- **Route**: `/notifications/add`
- **Functionality**:
  - Send notifications to ALL users simultaneously
  - Set notification title, message, and type (info, success, warning, error)
  - Real-time confirmation of delivery count

### 2. User Notification View (User View)

- **Location**: NOTIFICATIONS menu with badge count
- **Route**: `/user-notifications`
- **Features**:
  - View all notifications sorted by date (newest first)
  - Unread count badge in navigation
  - Different icons for different notification types:
    - ℹ️ Info notifications
    - 🎉 Success notifications
    - ⚠️ Warning notifications
    - ⛔ Error notifications
    - ✅ Booking confirmed
    - ❌ Booking rejected
    - ⏳ Booking pending
    - 💳 Payment received
  - Click to mark as read
  - "Mark All as Read" button
  - Timestamp with relative time display (e.g., "2 hours ago")

## Demo Steps

### Step 1: Login as Admin

1. Navigate to: http://localhost:4200
2. Login with admin credentials:
   - Email: `admin@hotel.com`
   - Password: `password123`

### Step 2: Send Bulk Notification

1. Click on **NOTIFICATIONS** in the header
2. Click **"+ Add Notification"** button
3. Fill in the form:
   - **Title**: "Special Weekend Offer"
   - **Message**: "Get 20% discount on all weekend bookings this month!"
   - **Type**: Success
4. Click **"Send to All Users"**
5. You should see confirmation: "Notification sent successfully to all users!"

### Step 3: View Notifications as User

1. Logout from admin account
2. Login with a regular user account (or create one)
3. Notice the **NOTIFICATIONS** badge in the header showing unread count
4. Click on **NOTIFICATIONS** menu
5. You should see:
   - The notification you just sent
   - Unread indicator (blue dot)
   - Proper icon (🎉 for success type)
   - Relative timestamp

### Step 4: Mark Notifications as Read

1. Click on any notification to mark it as read
2. The blue highlight and dot will disappear
3. Or click **"Mark All as Read"** to mark all at once

## API Endpoints

### Backend Endpoints (Running on port 8095)

1. **Send Bulk Notification** (Admin)

   ```
   POST http://localhost:8095/api/notifications/bulk
   Content-Type: application/json

   {
     "title": "Notification Title",
     "message": "Notification message content",
     "type": "info|success|warning|error"
   }
   ```

2. **Get User Notifications**

   ```
   GET http://localhost:8095/api/notifications/user/{userId}
   ```

3. **Get Unread Count**

   ```
   GET http://localhost:8095/api/notifications/user/{userId}/unread-count
   ```

4. **Mark as Read**

   ```
   PUT http://localhost:8095/api/notifications/{notificationId}/read
   ```

5. **Mark All as Read**
   ```
   PUT http://localhost:8095/api/notifications/user/{userId}/read-all
   ```

## Technical Details

### Changes Made

1. **Removed Kafka Dependency**

   - Deleted `KafkaConsumerConfig.java`
   - Deleted `NotificationListener.java`
   - Removed Kafka from `pom.xml`
   - Removed Kafka configuration from `application.yml`
   - Changed port from 8096 to 8095

2. **Added Bulk Notification Feature**

   - New `/bulk` endpoint in `NotificationServiceController.java`
   - Uses WebClient to fetch all user IDs from user-service
   - Creates notifications for all users in one operation
   - Returns count of notifications sent

3. **Updated Frontend**

   - Modified `notifications-add.component.ts` to support bulk sending
   - Updated form to show "Send to All Users" button
   - Added notification type icons for info/success/warning/error
   - Already had user notification view with badge count

4. **Security Configuration**
   - Added `/api/users/internal/user-ids` endpoint for service-to-service communication
   - Configured SecurityConfig to allow internal endpoint without authentication

### Database

- **Collection**: `user_notifications` in MongoDB Atlas
- **Fields**:
  - `id`: Notification ID
  - `userId`: User ID who receives the notification
  - `title`: Notification title
  - `message`: Notification message
  - `type`: Notification type (info, success, warning, error, BOOKING_CONFIRMED, etc.)
  - `referenceId`: Optional reference to booking/payment
  - `read`: Boolean flag
  - `createdAt`: Timestamp

## Testing Commands

### Test Bulk Notification (via curl)

```bash
curl -X POST "http://localhost:8095/api/notifications/bulk" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Welcome to Hotel Management",
    "message":"This is a test notification for all users",
    "type":"info"
  }'
```

### Check All Notifications

```bash
curl -s "http://localhost:8095/api/notifications" | python3 -m json.tool
```

### Check User-Specific Notifications

```bash
curl -s "http://localhost:8095/api/notifications/user/{userId}" | python3 -m json.tool
```

## Current System State

### Services Running

- Service Registry: http://localhost:8761
- API Gateway: http://localhost:8080
- User Service: http://localhost:8091
- Hotel Service: http://localhost:8092
- Booking Service: http://localhost:8093
- Payment Service: http://localhost:8094
- **Notification Service**: http://localhost:8095 ✅
- Review Service: http://localhost:8096
- Analytics Service: http://localhost:8097
- Frontend: http://localhost:4200

### Test Data

- **Total Users**: 5 (including admin)
- **Admin**: admin@hotel.com
- **Sample Notifications Sent**: 2 bulk notifications (10 total notification records)

## Demo Tips

1. **Show Multiple Users**: Create 2-3 user accounts and show how all receive the same notification
2. **Show Unread Badge**: Highlight the real-time unread count in the navigation
3. **Show Different Types**: Send notifications with different types (info, success, warning, error)
4. **Show Persistence**: Logout/login and show notifications are still there
5. **Show Mark as Read**: Demonstrate both individual and bulk mark as read

## Future Enhancements (Optional)

- Email notifications for important events
- Push notifications using browser API
- Notification preferences per user
- Notification categories/filtering
- Rich text formatting in messages
- Attachments or links in notifications
