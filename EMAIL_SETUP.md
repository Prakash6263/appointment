# Partner Backend API - Email Configuration Guide

## Overview

This document describes the email system for the Partner Backend API, including verification emails and approval notifications.

## Email Templates

### 1. Partner Email Verification

**File**: `/utils/emailTemplates.js` - `getPartnerVerificationEmailHTML()`

**Purpose**: Sent immediately after partner registration to verify their email address.

**Data Used**:
- Company Name
- Owner Name
- Verification Link (dynamically generated from `BACKEND_BASE_URL` env variable)

**Template Features**:
- Professional gradient header (purple gradient)
- Clear call-to-action button
- Alternative verification link text
- 24-hour expiry notice
- Security reminder
- Responsive design for mobile
- Company and owner information footer

**Example Preview**:
```
Header: "✓ Verify Your Partner Account"
Body includes:
- Personalized greeting with owner name
- Company name highlight
- 3-step setup instructions
- Prominent verify button
- Backup link for email clients that don't render buttons
- Account details summary
```

### 2. Partner Approval Email

**File**: `/utils/emailTemplates.js` - `getPartnerApprovalEmailHTML()`

**Purpose**: Sent by admin after approving partner account.

**Data Used**:
- Company Name
- Owner Name
- Login URL (dynamically generated from `FRONTEND_BASE_URL` env variable)

**Template Features**:
- Success-themed green gradient header
- Clear feature list of available actions
- Direct login link
- Next steps instructions
- Responsive design
- Support information

## Environment Variables Setup

### Required Environment Variables

```env
# Backend Configuration
BACKEND_BASE_URL=http://localhost:5000

# Frontend Configuration
FRONTEND_BASE_URL=http://localhost:3000

# Email Configuration (Gmail SMTP)
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-specific-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
```

### Setting Up Gmail SMTP

1. **Enable 2-Factor Authentication** on your Google Account:
   - Go to https://myaccount.google.com/
   - Click on "Security" in the left sidebar
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password
   - Copy this password to `GMAIL_APP_PASSWORD` in your `.env` file

3. **Set Your Email**:
   - Use your full Gmail address for `GMAIL_EMAIL`
   - Example: `yourname@gmail.com`

## Email Flow

### Registration Flow

```
1. Partner Registration (POST /api/partner/register)
   ↓
2. Partner document created in DB with status: "PENDING"
   ↓
3. Email verification token generated (24-hour expiry)
   ↓
4. Verification link constructed using BACKEND_BASE_URL
   ↓
5. HTML email sent to partner with verification link
   ↓
6. Partner clicks link or uses alternative
   ↓
7. Email verified (PUT /api/partner/verify-email/:token)
   ↓
8. Status changes to "EMAIL_VERIFIED" (waiting for admin)
```

### Approval Flow

```
1. Admin approves partner (PATCH /api/admin/partners/:id/approve)
   ↓
2. Partner status changes to "VERIFIED"
   ↓
3. Approval email sent with login URL
   ↓
4. Partner receives email with dashboard login link
   ↓
5. Partner can now log in and manage providers/services
```

## Email Template Customization

### Changing Colors

Edit `/utils/emailTemplates.js`:

**Verification Email Colors**:
- Primary Purple: `#667eea` → Change to your brand color
- Secondary Purple: `#764ba2` → Complementary color

**Approval Email Colors**:
- Success Green: `#10b981` → Change to your brand color
- Secondary Green: `#059669` → Complementary color

**Backup Gray**: `#f9f9f9` → Background colors

### Changing Text Content

All text content in email templates can be customized by editing the HTML strings in:
- `/utils/emailTemplates.js`

Key sections to customize:
- Header title and subtitle
- Body greeting and introduction
- Feature lists
- Footer copyright year (automatically updated)
- Support information

### Custom Branding

To add your company logo:

1. Update the email header HTML:
```html
<!-- Add before the title -->
<img src="YOUR_LOGO_URL" alt="Logo" style="height: 40px; margin-bottom: 10px;">
```

2. Update footer links to point to your actual URLs:
```javascript
// In emailTemplates.js, update:
<a href="#">Privacy Policy</a>  // → <a href="your-privacy-url">Privacy Policy</a>
<a href="#">Terms & Conditions</a>  // → etc.
```

## Testing Email Templates

### 1. Test Verification Email

```bash
# Using Postman or curl
POST /api/partner/register
Body: {
  "companyName": "Tech Solutions Inc",
  "ownerName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

Check your email inbox for the verification email.

### 2. Test Approval Email

```bash
# Admin login first to get token
POST /api/auth/login
Body: {
  "email": "admin@platform.com",
  "password": "admin123"
}

# Then approve partner
PATCH /api/admin/partners/{partnerId}/approve
Headers: {
  "Authorization": "Bearer {adminToken}"
}
```

Check partner's email inbox for approval email.

## Troubleshooting

### Email Not Sending

**Issue**: "Failed to send verification email"

**Solutions**:
1. Verify `GMAIL_EMAIL` and `GMAIL_APP_PASSWORD` are correct
2. Ensure 2FA is enabled on Google Account
3. Check that app-specific password is being used (not regular password)
4. Verify network connectivity to SMTP server
5. Check logs for detailed error messages

### Verification Link Not Working

**Issue**: "Invalid or expired verification token"

**Solutions**:
1. Ensure `BACKEND_BASE_URL` is correctly set in `.env`
2. Check that token hasn't expired (24-hour limit)
3. Verify the token was correctly generated
4. Check URL encoding if passing via query parameters

### Email Styling Issues

**Issue**: Email appears broken or unstyled

**Solutions**:
1. Most email clients support inline CSS (used in templates)
2. Images require CORS-enabled URLs
3. Test with multiple email clients (Gmail, Outlook, Apple Mail)
4. Some clients strip certain CSS properties

## Email Sending Service (Optional Upgrade)

For production, consider using:
- **SendGrid**: Professional email service with better deliverability
- **Mailgun**: Developer-friendly API
- **AWS SES**: Cost-effective at scale
- **Brevo (Sendinblue)**: Free tier available

Simply replace the nodemailer configuration in `/utils/partnerEmailUtils.js` with your service's SDK.

## Security Best Practices

1. **Never log sensitive data**: Email addresses and tokens are logged only for debugging
2. **Token expiry**: Set appropriate expiry times (24 hours for email verification)
3. **Use environment variables**: Never hardcode credentials
4. **HTTPS only**: In production, all verification links should be HTTPS
5. **Rate limiting**: Consider implementing rate limiting on registration endpoint to prevent abuse

## Email Headers

All emails include:
- `From`: Configured via `GMAIL_EMAIL` environment variable
- `To`: Partner's registered email address
- `Subject`: Clear, descriptive subject lines
- `Date`: Automatically added by SMTP server
- `Content-Type`: `text/html; charset=UTF-8`

## Monitoring and Logs

Check server logs for email sending status:

```javascript
// Success
[v0] Verification email sent to john@example.com

// Error
[v0] Email sending error: Error details...
```

Monitor these logs to identify any email delivery issues.
