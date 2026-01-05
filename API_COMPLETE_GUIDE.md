# Complete Authentication API Guide

## Overview
Full-stack authentication API with OTP email verification, password reset, profile management with image uploads, and Google OAuth support. Built with Node.js, Express, MongoDB, and Multer.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (.env)
```
MONGODB_URI=mongodb://localhost:27017/auth-db
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Gmail SMTP Configuration
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_app_password_here

PORT=5000
```

### 3. Run the Server
```bash
npm run dev
```

Server will start at `http://localhost:5000`

---

## API Endpoints

### Authentication Endpoints

#### 1. Customer Signup
**POST** `/api/auth/signup`

Request:
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

Response:
```json
{
  "success": true,
  "message": "Signup successful. Please verify your email with OTP",
  "data": {
    "userId": "user_id",
    "email": "customer@example.com",
    "role": "customer"
  }
}
```

#### 2. Provider Signup
**POST** `/api/auth/signup`

Request:
```json
{
  "email": "provider@example.com",
  "username": "provider123",
  "phoneNumber": "+1234567890",
  "password": "password123",
  "role": "provider",
  "firstName": "Service",
  "lastName": "Provider"
}
```

#### 3. Verify OTP
**POST** `/api/auth/verify-otp`

Request:
```json
{
  "userId": "user_id",
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "userId": "user_id",
    "email": "customer@example.com",
    "role": "customer"
  }
}
```

#### 4. Resend OTP
**POST** `/api/auth/resend-otp`

Request:
```json
{
  "email": "customer@example.com"
}
```

#### 5. Login
**POST** `/api/auth/login`

Request:
```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token",
    "user": {
      "_id": "user_id",
      "email": "customer@example.com",
      "role": "customer",
      "firstName": "John",
      "lastName": "Doe",
      "profileImage": "/uploads/profile-1234567890.jpg",
      "contact": "123-456-7890",
      "address": "123 Main St",
      "isEmailVerified": true
    }
  }
}
```

#### 6. Google OAuth Login
**POST** `/api/auth/google-auth`

Request:
```json
{
  "googleId": "google_unique_id",
  "email": "user@gmail.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer"
}
```

Response: (same as login)

---

### Password Reset Endpoints

#### 1. Forgot Password
**POST** `/api/auth/forgot-password`

Request:
```json
{
  "email": "customer@example.com"
}
```

Response:
```json
{
  "success": true,
  "message": "Password reset OTP sent to your email",
  "data": {
    "userId": "user_id"
  }
}
```

#### 2. Verify Reset OTP
**POST** `/api/auth/verify-reset-otp`

Request:
```json
{
  "userId": "user_id",
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "userId": "user_id"
  }
}
```

#### 3. Reset Password
**POST** `/api/auth/reset-password`

Request:
```json
{
  "userId": "user_id",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

Response:
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "userId": "user_id"
  }
}
```

---

### Profile Management Endpoints

#### Edit Profile with Image Upload
**PUT** `/api/auth/edit-profile/:userId`

Request: (FormData)
- firstName: string
- lastName: string
- contact: string
- address: string
- email: string
- profileImage: file (optional, image only, max 5MB)

Response:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "customer@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "profileImage": "/uploads/profile-1234567890.jpg",
      "contact": "07 007089 0620",
      "address": "2281 Rohar Street, Mumbai, India"
    }
  }
}
```

---

## Database Schema

### User Model
```javascript
{
  email: String (required, unique),
  username: String (sparse, unique),
  phoneNumber: String (sparse),
  password: String (hashed with bcrypt),
  role: String (customer | provider),
  
  // Profile fields
  firstName: String,
  lastName: String,
  profileImage: String (file path),
  contact: String,
  address: String,
  
  // Verification
  otp: String,
  otpExpires: Date,
  isEmailVerified: Boolean,
  
  // Password reset
  resetPasswordOtp: String,
  resetPasswordOtpExpires: Date,
  
  // OAuth
  googleId: String,
  
  // Status
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Image Upload Details

### Multer Configuration
- **Destination**: `/uploads` directory
- **File Types**: JPEG, PNG, GIF, WebP
- **Max File Size**: 5MB
- **Filename Format**: `profile-{timestamp}-{randomId}.{ext}`

### Accessing Uploaded Images
Images are served at: `http://localhost:5000/uploads/profile-{filename}`

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation failed, invalid credentials, etc.)
- 403: Forbidden (email not verified)
- 404: Not Found (user doesn't exist)
- 500: Server Error

---

## Security Features

1. **Password Hashing**: bcryptjs with salt rounds 10
2. **JWT Tokens**: 7-day expiration by default
3. **OTP Verification**: 6-digit codes with 10-minute expiration
4. **Image Validation**: Only image files allowed, file type and size restrictions
5. **Email Validation**: Using express-validator
6. **CORS**: Enabled for cross-origin requests

---

## File Structure

```
├── server.js
├── package.json
├── .env.example
├── routes/
│   ├── index.js
│   └── auth.js
├── controllers/
│   └── authController.js
├── models/
│   └── User.js
├── middleware/
│   ├── validation.js
│   ├── auth.js
│   └── multer.js
├── services/
│   └── emailService.js
├── utils/
│   └── otpUtils.js
└── uploads/
    └── (profile images stored here)
```

---

## Testing with Postman

1. Import `postman_collection.json` into Postman
2. Set `base_url` variable to `http://localhost:5000`
3. Follow signup → verify OTP → login flow
4. Use the token from login response for authenticated requests

---

## Gmail SMTP Setup

1. Enable 2-factor authentication on your Google account
2. Generate an App Password from Google Account Settings
3. Use the App Password in `.env` file as `GMAIL_PASSWORD`

---

## Future Enhancements

- Two-factor authentication (2FA)
- Social login (Facebook, GitHub)
- Role-based access control (RBAC)
- Refresh token implementation
- Rate limiting
- Email templates customization
