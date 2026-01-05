# Authentication API Documentation

## Project Structure
```
├── server.js                    # Main entry point
├── models/
│   └── User.js                 # User schema with role-based fields
├── controllers/
│   └── authController.js       # All auth logic
├── routes/
│   ├── index.js               # Main routes file
│   └── auth.js                # Auth endpoints
├── middleware/
│   └── validation.js          # Validation rules and handlers
├── services/
│   └── emailService.js        # Email sending logic
├── utils/
│   └── otpUtils.js            # OTP generation
└── .env                        # Environment variables
```

## Endpoints

### 1. Signup (Customer or Provider)
**POST** `/api/auth/signup`

**Customer Request:**
```json
{
  "email": "customer@example.com",
  "username": "customer123",
  "phoneNumber": "+1234567890",
  "password": "password123",
  "role": "customer",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Provider Request:**
```json
{
  "email": "provider@example.com",
  "username": "provider123",
  "phoneNumber": "+1234567890",
  "password": "password123",
  "role": "provider",
  "businessName": "ABC Services",
  "businessCategory": "Plumbing"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Signup successful. Please verify your email with OTP",
  "data": {
    "userId": "user_id_here",
    "email": "customer@example.com",
    "role": "customer"
  }
}
```

### 2. Verify OTP
**POST** `/api/auth/verify-otp`

**Request:**
```json
{
  "userId": "user_id_here",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "userId": "user_id_here",
    "email": "customer@example.com",
    "role": "customer"
  }
}
```

### 3. Resend OTP
**POST** `/api/auth/resend-otp`

**Request:**
```json
{
  "email": "customer@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "userId": "user_id_here"
  }
}
```

### 4. Login
**POST** `/api/auth/login`

**Request:**
```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "_id": "user_id",
      "email": "customer@example.com",
      "username": "customer123",
      "role": "customer",
      "firstName": "John",
      "lastName": "Doe",
      "isEmailVerified": true,
      "isActive": true,
      "createdAt": "2024-01-05T10:00:00.000Z",
      "updatedAt": "2024-01-05T10:05:00.000Z"
    }
  }
}
```

## Environment Variables Required

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

## Features

✅ Separate role-based User model (Customer & Provider)
✅ Email OTP verification with 10-minute expiration
✅ Password hashing with bcryptjs
✅ JWT token generation on successful login
✅ Comprehensive validation middleware
✅ Error handling for all scenarios
✅ MongoDB integration with Mongoose
✅ Gmail SMTP email service
