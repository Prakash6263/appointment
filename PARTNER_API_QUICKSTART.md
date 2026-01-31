# Partner Backend API - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Backend & Frontend URLs (for email links)
BACKEND_BASE_URL=http://localhost:5000
FRONTEND_BASE_URL=http://localhost:3000

# Gmail SMTP Setup
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password-16-chars

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# Database
MONGODB_URI=mongodb://localhost:27017/appointment_app

# Server
PORT=5000
NODE_ENV=development
```

### 3. Setup Gmail SMTP (Required for Email)

**Get Gmail App Password:**

1. Go to https://myaccount.google.com/
2. Enable 2-Step Verification (if not already done)
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password
6. Paste into `GMAIL_APP_PASSWORD` in `.env`

### 4. Start MongoDB

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Start the Server

```bash
npm start
# Server running on http://localhost:5000
```

---

## 📧 Email System Overview

### Email Flow

```
Partner Registration
    ↓
✓ Verification Email Sent
    ↓
Partner Clicks Verify Link
    ↓
Admin Reviews Partner
    ↓
✓ Approval Email Sent
    ↓
Partner Logs In & Uses Dashboard
```

### Environment Variables for Email

| Variable | Purpose | Example |
|----------|---------|---------|
| `BACKEND_BASE_URL` | Email verification link domain | `http://localhost:5000` |
| `FRONTEND_BASE_URL` | Login link in approval email | `http://localhost:3000` |
| `GMAIL_EMAIL` | Sender email address | `noreply@company.com` |
| `GMAIL_APP_PASSWORD` | Gmail SMTP password | `abcd efgh ijkl mnop` |

### Email Templates

Two professional HTML email templates:

1. **Verification Email** (`/utils/emailTemplates.js`)
   - Sent after registration
   - 24-hour expiry link
   - Purple gradient design
   - Includes verification button and backup link

2. **Approval Email** (`/utils/emailTemplates.js`)
   - Sent after admin approval
   - Login link to dashboard
   - Green success design
   - Next steps instructions

---

## 🧪 Testing with Postman

### 1. Import Postman Collection

1. Open Postman
2. Click "Import"
3. Select `/postman_collection.json`
4. Collection imported with environment variables pre-configured

### 2. Test Registration Flow

**Step 1: Register Partner**

```
POST http://localhost:5000/api/partner/register

Body (JSON):
{
  "companyName": "Tech Solutions Inc",
  "ownerName": "John Doe",
  "email": "john@techsolutions.com",
  "phone": "+1234567890",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}

Response:
{
  "success": true,
  "message": "Partner registered successfully. Please check your email to verify.",
  "partnerId": "507f1f77bcf86cd799439011"
}
```

**Check email inbox for verification link**

**Step 2: Verify Email**

Click the link in the email or use:

```
GET http://localhost:5000/api/partner/verify-email/{token-from-email}

Response:
{
  "success": true,
  "message": "Email verified successfully. Waiting for admin approval."
}
```

**Step 3: Admin Approves Partner**

```
# First login as admin
POST http://localhost:5000/api/auth/login
Body: {
  "email": "admin@platform.com",
  "password": "admin123"
}

# Then approve (use token from login response)
PATCH http://localhost:5000/api/admin/partners/{partnerId}/approve
Headers:
  Authorization: Bearer {adminToken}

Response:
{
  "success": true,
  "message": "Partner approved successfully",
  "partner": { ... }
}
```

**Check email for approval notification**

**Step 4: Partner Logs In**

```
POST http://localhost:5000/api/partner/login

Body:
{
  "email": "john@techsolutions.com",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "partner": { ... }
}
```

---

## 📁 Project Structure

```
/
├── models/
│   ├── Partner.js          # Partner schema with email verification
│   ├── Provider.js         # Service provider model
│   ├── Service.js          # Service offerings model
│   └── Booking.js          # Booking records model
│
├── controllers/
│   ├── partnerAuthController.js      # Registration, login, verification
│   ├── partnerProviderController.js  # Provider CRUD
│   ├── partnerServiceController.js   # Service CRUD
│   ├── partnerBookingController.js   # Booking management
│   └── adminPartnerController.js     # Admin operations
│
├── middleware/
│   ├── partnerAuth.middleware.js     # JWT verification for partners
│   └── role.middleware.js            # Role-based access control
│
├── utils/
│   ├── tokenUtils.js              # JWT generation/verification
│   ├── emailTemplates.js          # HTML email templates
│   └── partnerEmailUtils.js       # Email sending logic
│
├── routes/
│   └── partnerApi.routes.js       # All partner API endpoints
│
├── .env.example               # Environment variables template
├── EMAIL_SETUP.md             # Detailed email configuration
├── EMAIL_PREVIEW.md           # Email template previews
├── PARTNER_API_QUICKSTART.md  # This file
└── postman_collection.json    # Postman API collection
```

---

## 🔑 API Endpoints Summary

### Authentication
- `POST /api/partner/register` - Register new partner
- `POST /api/partner/login` - Partner login
- `GET /api/partner/verify-email/:token` - Verify email

### Partner Profile
- `GET /api/partner/profile` - Get profile
- `PUT /api/partner/profile` - Update profile

### Providers (CRUD)
- `POST /api/partner/providers` - Create provider
- `GET /api/partner/providers` - List providers
- `PUT /api/partner/providers/:id` - Update provider
- `DELETE /api/partner/providers/:id` - Delete provider

### Services (CRUD)
- `POST /api/partner/services` - Create service
- `GET /api/partner/services` - List services
- `PUT /api/partner/services/:id` - Update service
- `DELETE /api/partner/services/:id` - Delete service

### Bookings
- `GET /api/partner/bookings` - List bookings
- `PATCH /api/partner/bookings/:id/status` - Update booking status

### Admin Operations
- `GET /api/admin/partners` - List all partners
- `GET /api/admin/partners/:id` - Get partner details
- `PATCH /api/admin/partners/:id/approve` - Approve partner
- `PATCH /api/admin/partners/:id/suspend` - Suspend partner

---

## 🔒 Authentication

All partner and admin protected routes require JWT token:

```
Headers:
Authorization: Bearer {token}
```

Token is obtained from:
- Partner login: `POST /api/partner/login`
- Admin login: `POST /api/auth/login`

---

## 📧 Email Template Customization

### Change Colors

Edit `/utils/emailTemplates.js`:

**Verification Email** (Lines ~25-30):
```javascript
// Change from purple
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
// To your brand color
background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR_DARK 100%);
```

**Approval Email** (Lines ~200-210):
```javascript
// Change from green
background: linear-gradient(135deg, #10b981 0%, #059669 100%);
// To your brand color
background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR_DARK 100%);
```

### Add Company Logo

In `/utils/emailTemplates.js`, add before title:

```html
<img src="YOUR_LOGO_URL" alt="Company Logo" style="height: 50px; margin-bottom: 15px;">
```

### Update Footer Links

Replace placeholder links in both email templates:

```javascript
// From:
<a href="#">Privacy Policy</a>

// To:
<a href="https://yourcompany.com/privacy">Privacy Policy</a>
```

---

## 🐛 Troubleshooting

### Email Not Sending

**Error**: "Failed to send verification email"

**Check**:
1. Gmail 2FA is enabled
2. App-specific password is used (not regular Gmail password)
3. `GMAIL_EMAIL` matches your Gmail account
4. Network connectivity is working
5. Check server logs for specific error

### Verification Link Expired

**Error**: "Invalid or expired verification token"

**Solutions**:
1. Links expire after 24 hours
2. Request new registration for new link
3. Check `BACKEND_BASE_URL` is correctly set
4. Verify token wasn't modified

### Partner Can't Login After Approval

**Error**: "Partner account status is PENDING"

**Solutions**:
1. Ensure admin approved the partner
2. Check partner status is "VERIFIED" in database
3. Verify partner email was confirmed
4. Check token expiry settings

### Wrong Email/URL in Emails

**Solutions**:
1. Update `BACKEND_BASE_URL` for verification links
2. Update `FRONTEND_BASE_URL` for login links
3. Restart server after env changes
4. Check for typos in URLs

---

## 📚 Full Documentation

- **Email Setup**: See `EMAIL_SETUP.md`
- **Email Previews**: See `EMAIL_PREVIEW.md`
- **API Details**: See `postman_collection.json`

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Update `NODE_ENV` to `production`
- [ ] Set `BACKEND_BASE_URL` to your production URL (HTTPS)
- [ ] Set `FRONTEND_BASE_URL` to your production URL (HTTPS)
- [ ] Use production MongoDB connection string
- [ ] Use production-grade email service (SendGrid, Mailgun)
- [ ] Update footer links to real URLs
- [ ] Add company logo to emails
- [ ] Change email subjects if needed
- [ ] Test email delivery thoroughly
- [ ] Set up monitoring and logging
- [ ] Enable CORS for production domain
- [ ] Set secure cookie flags
- [ ] Enable rate limiting

---

## 🆘 Support

For issues or questions:

1. Check logs: `npm start` (development)
2. Review error messages in response
3. Check `.env` configuration
4. Verify email credentials
5. Test with Postman collection

---

**You're all set! Start registering partners and managing your backend API.** 🎉
