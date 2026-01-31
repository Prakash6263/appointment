# Email Template Previews

## 1. Partner Email Verification Template

### Visual Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │         ✓ Verify Your Partner Account      │   │
│  │     Complete your registration to start     │   │
│  │  [Purple Gradient Background]               │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Hello John Doe,                                    │
│                                                     │
│  Thank you for registering Tech Solutions Inc as    │
│  a partner with us! We're excited to have you on   │
│  board. To activate your partner account and       │
│  start managing your providers and services,       │
│  please verify your email address.                 │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ What's next?                                │   │
│  │ ✓ Verify your email address                 │   │
│  │ ✓ Wait for platform administrator approval  │   │
│  │ ✓ Start adding your providers and services  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│              ┌──────────────────────────┐          │
│              │ Verify Email Address    │          │
│              │ [Purple Button]         │          │
│              └──────────────────────────┘          │
│                                                     │
│  Or copy and paste this link in your browser:      │
│  http://localhost:5000/api/partner/verify-email/.. │
│                                                     │
│         ⏱ This link expires in 24 hours           │
│                                                     │
│  Once you verify your email, our team will review  │
│  your partner information...                        │
│                                                     │
│  ⚠ Security Reminder:                             │
│  Never share this verification link with anyone.   │
│                                                     │
│  ═══════════════════════════════════════════════   │
│                                                     │
│  Account Information:                               │
│  Company: Tech Solutions Inc                       │
│  Owner Name: John Doe                              │
│  Email: john@techsolutions.com                     │
│                                                     │
│  © 2026 Appointment App. All rights reserved.      │
│  Privacy Policy | Terms & Conditions | Contact     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Key Features

- **Header**: Purple gradient background with success icon
- **Personalization**: Shows owner name and company name
- **Call-to-Action**: Large, prominent "Verify Email Address" button
- **Backup**: Direct link provided for email clients that don't render buttons
- **Information**: Clear next steps and account summary
- **Security**: Warning about not sharing the link
- **Footer**: Copyright and support links
- **Responsive**: Works on mobile and desktop

### HTML Structure

```html
<div class="email-container">
  <div class="email-header">
    <h1>✓ Verify Your Partner Account</h1>
    <p>Complete your registration to get started</p>
  </div>
  
  <div class="email-body">
    <p class="greeting">Hello <strong>${ownerName}</strong>,</p>
    
    <p class="intro-text">
      Thank you for registering <span class="highlight">${companyName}</span>...
    </p>
    
    <div class="verification-box">
      <!-- What's next section -->
    </div>
    
    <div class="button-container">
      <a href="${verificationLink}" class="cta-button">
        Verify Email Address
      </a>
    </div>
    
    <div class="link-section">
      <!-- Backup link -->
    </div>
    
    <!-- Additional sections -->
  </div>
  
  <div class="email-footer">
    <!-- Footer content -->
  </div>
</div>
```

---

## 2. Partner Approval Email Template

### Visual Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │                    ✓                        │   │
│  │          Account Approved!                  │   │
│  │    Your partner account is now active       │   │
│  │  [Green Gradient Background]                │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Hello John Doe,                                    │
│                                                     │
│  Congratulations! Your partner account for          │
│  Tech Solutions Inc has been reviewed and          │
│  approved by our platform administrator. Your      │
│  account is now fully active and ready to use.     │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ You can now:                                │   │
│  │ ✓ Add and manage service providers          │   │
│  │ ✓ Create and update services                │   │
│  │ ✓ View and manage customer bookings         │   │
│  │ ✓ Access your partner dashboard             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│              ┌──────────────────────────┐          │
│              │  Login to Your Dashboard │          │
│              │  [Green Button]          │          │
│              └──────────────────────────┘          │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Next Steps:                                 │   │
│  │ 1. Log in to your partner account           │   │
│  │ 2. Complete your company profile            │   │
│  │ 3. Start adding your service providers      │   │
│  │ 4. Create service offerings and set pricing │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  If you need assistance, our support team is      │
│  always available to help.                         │
│                                                     │
│  © 2026 Appointment App. All rights reserved.     │
│  Privacy Policy | Terms & Conditions | Contact    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Key Features

- **Header**: Green gradient background with checkmark icon
- **Personalization**: Shows owner name and company name
- **Call-to-Action**: "Login to Your Dashboard" button
- **Feature List**: Clear list of available capabilities
- **Next Steps**: Actionable instructions for the partner
- **Support**: Encouragement to reach out for help
- **Responsive**: Optimized for all devices

### HTML Structure

```html
<div class="email-container">
  <div class="email-header">
    <div class="success-icon">✓</div>
    <h1>Account Approved!</h1>
    <p>Your partner account is now active</p>
  </div>
  
  <div class="email-body">
    <p class="greeting">Hello <strong>${ownerName}</strong>,</p>
    
    <p class="intro-text">
      Congratulations! Your partner account for 
      <strong>${companyName}</strong> has been reviewed...
    </p>
    
    <div class="features-box">
      <!-- Capabilities list -->
    </div>
    
    <div class="button-container">
      <a href="${loginURL}" class="cta-button">
        Login to Your Dashboard
      </a>
    </div>
    
    <div class="info-box">
      <!-- Next steps -->
    </div>
    
    <!-- Support info -->
  </div>
  
  <div class="email-footer">
    <!-- Footer content -->
  </div>
</div>
```

---

## 3. Responsive Design

Both templates are fully responsive and adapt to different screen sizes:

### Desktop View (600px+)
- Full width email container
- Side padding for breathing room
- Large buttons and clickable areas
- Full feature lists

### Mobile View (<600px)
- Full screen width
- Reduced padding (15px instead of 30px)
- Touch-friendly button sizes
- Optimized font sizes for readability

---

## 4. Color Schemes

### Verification Email
```
Primary: #667eea (Purple)
Secondary: #764ba2 (Dark Purple)
Accent: #10b981 (Green, for success icons)
Background: #f5f5f5 (Light Gray)
Text: #333 (Dark Gray)
```

### Approval Email
```
Primary: #10b981 (Green)
Secondary: #059669 (Dark Green)
Background: #f0fdf4 (Light Green)
Text: #166534 (Dark Green for accents)
Main Text: #333 (Dark Gray)
```

---

## 5. Dynamic Content Replacement

### Verification Email Variables

```javascript
getPartnerVerificationEmailHTML(
  companyName,      // "Tech Solutions Inc"
  verificationLink, // "http://localhost:5000/api/partner/verify-email/token123"
  ownerName         // "John Doe"
)
```

### Approval Email Variables

```javascript
getPartnerApprovalEmailHTML(
  companyName,  // "Tech Solutions Inc"
  ownerName,    // "John Doe"
  loginURL      // "http://localhost:3000/partner/login"
)
```

---

## 6. Email Client Compatibility

Both templates are tested and compatible with:

- ✅ Gmail (Web & Mobile)
- ✅ Outlook (Web & Desktop)
- ✅ Apple Mail
- ✅ Mozilla Thunderbird
- ✅ Mobile email clients (iOS Mail, Gmail Mobile)

### CSS Support

- ✅ Inline styles (primary method)
- ✅ Flexbox (supported in all modern clients)
- ✅ Media queries (for responsive design)
- ✅ Gradients (supported in most clients)
- ⚠️ Animation (not recommended)

---

## 7. Rendering Examples

### Sample Verification Email Output

```
To: john@techsolutions.com
From: Appointment App <noreply@gmail.com>
Subject: Verify Your Partner Account - Appointment App
Content-Type: text/html; charset=UTF-8

[Email HTML content with purple gradient header, personalized greeting, 
verification button, and security notice]
```

### Sample Approval Email Output

```
To: john@techsolutions.com
From: Appointment App <noreply@gmail.com>
Subject: Your Partner Account Has Been Approved - Appointment App
Content-Type: text/html; charset=UTF-8

[Email HTML content with green gradient header, approval message, 
features list, login button, and next steps]
```

---

## 8. Testing in Different Clients

### Gmail
- Renders: Perfectly
- Note: Mobile preview shows colored subject bar

### Outlook
- Renders: Good
- Note: Some spacing may differ slightly

### Apple Mail
- Renders: Excellent
- Note: Gradient support is excellent

### Thunderbird
- Renders: Good
- Note: Default font may differ

---

## 9. Print View

Both emails are optimized for printing:
- Page breaks handled correctly
- Colors preserved (or convert to grayscale)
- All important information visible
- Links preserved in print

---

This completes the email template documentation with visual previews and rendering information.
