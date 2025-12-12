# User Service - JWT Authentication & Authorization

## ✅ Features Implemented

### 1. **User Registration & Authentication**

- ✅ Register new users with email/password
- ✅ Login with email and password validation
- ✅ JWT token generation on successful login
- ✅ BCrypt password encryption
- ✅ Role-based access (admin/user)

### 2. **JWT-Based Authorization**

- ✅ JWT tokens include: email, role, firstName, lastName
- ✅ Token expiration: 1 hour (configurable)
- ✅ JWT validation on protected endpoints
- ✅ Bearer token authentication

### 3. **User Profile Management**

- ✅ Get user profile
- ✅ Update user profile (firstName, lastName, phone)
- ✅ View all users (admin only)

---

## 🔐 API Endpoints

### **Public Endpoints (No Auth Required)**

#### 1. Register User

```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123"
}
```

**Response:**

```json
{
  "message": "Registration successful",
  "email": "john@example.com",
  "role": "user"
}
```

#### 2. Login

```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "john@example.com",
  "role": "user",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### 3. Health Check

```http
GET http://localhost:8080/api/auth/health
```

---

### **Protected Endpoints (JWT Required)**

> Add header: `Authorization: Bearer <your-jwt-token>`

#### 4. Get User Profile

```http
GET http://localhost:8080/api/users/profile
Authorization: Bearer <your-jwt-token>
```

**Response:**

```json
{
  "id": "1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "user",
  "active": true
}
```

#### 5. Update User Profile

```http
PUT http://localhost:8080/api/users/profile
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+9876543210"
}
```

#### 6. Validate Token

```http
GET http://localhost:8080/api/users/validate
Authorization: Bearer <your-jwt-token>
```

#### 7. Get All Users (Admin Only)

```http
GET http://localhost:8080/api/users/all
Authorization: Bearer <admin-jwt-token>
```

**Response:**

```json
{
  "total": 2,
  "users": [
    {
      "id": "1",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@hotel.com",
      "role": "admin",
      "active": true
    },
    {
      "id": "1234567890",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user",
      "active": true
    }
  ]
}
```

---

## 👤 Demo Users

### Admin User (Pre-loaded)

- **Email:** `admin@hotel.com`
- **Password:** `admin123`
- **Role:** `admin`

### Test Regular User (After Registration)

- **Email:** Any email you register
- **Password:** Your password
- **Role:** `user`

---

## 🔒 Authorization Rules

| Endpoint       | Guest | User | Admin |
| -------------- | ----- | ---- | ----- |
| Register       | ✅    | ✅   | ✅    |
| Login          | ✅    | ✅   | ✅    |
| Get Profile    | ❌    | ✅   | ✅    |
| Update Profile | ❌    | ✅   | ✅    |
| View All Users | ❌    | ❌   | ✅    |

---

## 🧪 Testing the Flow

### Step 1: Register a New User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "password": "MyPassword123"
  }'
```

### Step 2: Login with Registered User

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane@example.com",
    "password": "MyPassword123"
  }'
```

**Save the token from response!**

### Step 3: Access Protected Endpoint

```bash
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Step 4: Update Profile

```bash
curl -X PUT http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "phone": "+9876543210"
  }'
```

### Step 5: Try Admin Endpoint (Should Fail for Regular User)

```bash
curl -X GET http://localhost:8080/api/users/all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Step 6: Login as Admin and Access Admin Endpoint

```bash
# First login as admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@hotel.com",
    "password": "admin123"
  }'

# Then use admin token to view all users
curl -X GET http://localhost:8080/api/users/all \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE"
```

---

## 🎯 Key Security Features

1. **Password Security**

   - BCrypt encryption with strength 10
   - Passwords never stored in plain text
   - Password validation on login

2. **JWT Security**

   - Signed with HS256 algorithm
   - Secret key: `myUltraSecretKeyForJWTGeneration12345`
   - Expiration: 1 hour
   - Contains: email, role, firstName, lastName

3. **Role-Based Access Control (RBAC)**

   - Admin role: Full access
   - User role: Limited to own profile
   - Guest: Only register/login

4. **Token Validation**
   - JWT signature verification
   - Expiration checking
   - Email matching

---

## 📝 Angular Integration

The dashboard now properly:

- ✅ Calls backend APIs for login/register
- ✅ Stores JWT token in localStorage
- ✅ Sends JWT token with all requests via HTTP interceptor
- ✅ Validates credentials before allowing login
- ✅ Shows proper error messages for invalid credentials

**No more mock authentication!** All authentication goes through the backend with proper JWT validation.

---

## 🔧 Configuration

### JWT Settings (`application.yml`)

```yaml
jwt:
  secret: myUltraSecretKeyForJWTGeneration12345
  expiration: 3600000 # 1 hour in milliseconds
```

### Security Configuration

- `/api/auth/**` - Public (no authentication required)
- `/api/users/**` - Protected (JWT required)
- CORS enabled for all origins
- Stateless session management

---

## 📦 Storage

Currently using **in-memory HashMap** storage. Users are lost on service restart.

### To Enable MongoDB:

See `MONGODB-SETUP.md` for instructions to switch to persistent database storage.

---

## ✨ Next Steps

1. ✅ **Registration** - Users can register accounts
2. ✅ **Authentication** - JWT-based login with password validation
3. ✅ **Authorization** - Role-based access control
4. ✅ **Profile Management** - Get/Update user profiles
5. 🔄 **Booking History** - Add endpoint to track user bookings
6. 🔄 **MongoDB Integration** - Switch to persistent storage
7. 🔄 **Email Verification** - Add email confirmation
8. 🔄 **Password Reset** - Forgot password functionality
