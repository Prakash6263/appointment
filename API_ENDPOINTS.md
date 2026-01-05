# Authentication API Endpoints

## Base URL
```
http://localhost:5000/api/auth
```

## Endpoints

### 1. Signup
**POST** `/signup`

Request body:
```json
{
  "email": "user@example.com",
  "username": "username123",
  "phoneNumber": "+1234567890",
  "password": "Password123",
  "role": "customer" // or "provider"
}
```

For Customer, add:
```json
{
  "firstName": "John",
  "lastName": "Doe"
}
```

For Provider, add:
```json
{
  "businessName": "My Business",
  "businessCategory": "Plumbing"
}
```

Response:
```json
{
  "success": true,
  "message": "Signup successful. Please verify your email with OTP",
  "data": {
    "userId": "user_id",
    "email": "user@example.com"
  }
}
```

---

### 2. Verify OTP
**POST** `/verify-otp`

Request body:
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
    "email": "user@example.com"
  }
}
```

---

### 3. Resend OTP
**POST** `/resend-otp`

Request body:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "userId": "user_id"
  }
}
```

---

### 4. Login
**POST** `/login`

Request body:
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "username": "username123",
      "role": "customer",
      "isEmailVerified": true
    }
  }
}
```

---

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Add your MongoDB URI
   - Add Gmail credentials (use App Password for Gmail)
   - Add JWT secret

3. **Run the server:**
   ```bash
   npm run dev
   ```

4. **Test endpoints using Postman or cURL**

## Notes
- OTP expires in 10 minutes
- Email verification is required before login
- Passwords are hashed with bcrypt
- JWT tokens expire in 7 days (configurable)
