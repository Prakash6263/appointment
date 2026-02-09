const getPartnerVerificationEmailHTML = (companyName, verificationLink, ownerName, email) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Partner Email Verification</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .email-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
          text-align: center;
          color: white;
        }
        .email-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .email-header p {
          margin: 8px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .email-body {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .greeting strong {
          color: #667eea;
        }
        .intro-text {
          color: #555;
          margin-bottom: 30px;
          line-height: 1.8;
          font-size: 15px;
        }
        .verification-box {
          background-color: #f9f9f9;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 30px 0;
          border-radius: 4px;
        }
        .verification-box p {
          margin: 0 0 15px 0;
          color: #666;
          font-size: 14px;
        }
        .verification-box p:last-child {
          margin-bottom: 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 14px 40px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          transition: opacity 0.3s ease;
        }
        .cta-button:hover {
          opacity: 0.9;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .link-section {
          background-color: #f0f0f0;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
          word-break: break-all;
        }
        .link-section p {
          margin: 0 0 8px 0;
          color: #666;
          font-size: 13px;
          font-weight: 500;
        }
        .link-section a {
          color: #667eea;
          text-decoration: none;
          font-size: 12px;
          display: block;
          word-wrap: break-word;
        }
        .info-text {
          color: #888;
          font-size: 14px;
          margin: 20px 0;
          line-height: 1.6;
        }
        .warning-text {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 12px 15px;
          border-radius: 4px;
          color: #856404;
          font-size: 13px;
          margin: 20px 0;
        }
        .email-footer {
          background-color: #f9f9f9;
          padding: 30px;
          border-top: 1px solid #eee;
          text-align: center;
        }
        .footer-divider {
          border: none;
          border-top: 1px solid #ddd;
          margin: 30px 0;
        }
        .footer-text {
          color: #999;
          font-size: 12px;
          margin: 0;
        }
        .footer-links {
          margin-top: 15px;
        }
        .footer-links a {
          color: #667eea;
          text-decoration: none;
          font-size: 12px;
          margin: 0 10px;
        }
        .company-info {
          color: #666;
          font-size: 13px;
          margin-top: 20px;
          line-height: 1.8;
        }
        .highlight {
          color: #667eea;
          font-weight: 600;
        }
        .expiry-badge {
          display: inline-block;
          background-color: #fff3cd;
          color: #856404;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          margin: 10px 0;
        }
        @media (max-width: 600px) {
          .email-container {
            border-radius: 0;
          }
          .email-header {
            padding: 30px 15px;
          }
          .email-header h1 {
            font-size: 24px;
          }
          .email-body {
            padding: 20px 15px;
          }
          .cta-button {
            padding: 12px 30px;
            font-size: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="email-header">
          <h1>✓ Verify Your Partner Account</h1>
          <p>Complete your registration to get started</p>
        </div>

        <!-- Body -->
        <div class="email-body">
          <p class="greeting">Hello <strong>${ownerName}</strong>,</p>

          <p class="intro-text">
            Thank you for registering <span class="highlight">${companyName}</span> as a partner with us! 
            We're excited to have you on board. To activate your partner account and start managing your 
            providers and services, please verify your email address by clicking the button below.
          </p>

          <div class="verification-box">
            <p><strong>What's next?</strong></p>
            <p>✓ Verify your email address by clicking the button below</p>
            <p>✓ Wait for platform administrator approval of your account</p>
            <p>✓ Start adding your providers and services</p>
          </div>

          <!-- CTA Button -->
          <div class="button-container">
            <a href="${verificationLink}" class="cta-button">Verify Email Address</a>
          </div>

          <!-- Alternative Link -->
          <div class="link-section">
            <p><strong>Or copy and paste this link in your browser:</strong></p>
            <a href="${verificationLink}">${verificationLink}</a>
          </div>

          <!-- Expiry Info -->
          <div style="text-align: center;">
            <span class="expiry-badge">⏱ This link expires in 24 hours</span>
          </div>

          <!-- Info Text -->
          <p class="info-text">
            Once you verify your email, our team will review your partner information and send you 
            an approval notification. This typically takes 24-48 hours.
          </p>

          <!-- Security Warning -->
          <div class="warning-text">
            <strong>Security Reminder:</strong> Never share this verification link with anyone. 
            If you didn't create this account, please ignore this email.
          </div>

          <!-- Additional Help -->
          <p class="info-text">
            If the button above doesn't work, or if you have any questions, please don't hesitate to 
            contact our support team.
          </p>

          <hr class="footer-divider">

          <!-- Company Info -->
          <div class="company-info">
            <p><strong>Account Information:</strong></p>
            <p>Company: ${companyName}</p>
            <p>Owner Name: ${ownerName}</p>
            <p>Email: <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></p>
          </div>
        </div>

        <!-- Footer -->
        <div class="email-footer">
          <p class="footer-text">
            © ${new Date().getFullYear()} Appointment App. All rights reserved.
          </p>
          <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
            <a href="#">Contact Support</a>
          </div>
          <p class="footer-text" style="margin-top: 15px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

const getPartnerApprovalEmailHTML = (companyName, ownerName, loginURL) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Partner Account Approved</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .email-header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          padding: 40px 20px;
          text-align: center;
          color: white;
        }
        .email-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .email-header .success-icon {
          font-size: 40px;
          margin-bottom: 10px;
        }
        .email-body {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .greeting strong {
          color: #10b981;
        }
        .intro-text {
          color: #555;
          margin-bottom: 30px;
          line-height: 1.8;
          font-size: 15px;
        }
        .features-box {
          background-color: #f0fdf4;
          border-left: 4px solid #10b981;
          padding: 20px;
          margin: 30px 0;
          border-radius: 4px;
        }
        .features-box p {
          margin: 0 0 12px 0;
          color: #166534;
          font-size: 14px;
        }
        .features-box p:last-child {
          margin-bottom: 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 14px 40px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          transition: opacity 0.3s ease;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .info-box {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .info-box p {
          margin: 0 0 8px 0;
          color: #666;
          font-size: 14px;
        }
        .info-box p:last-child {
          margin-bottom: 0;
        }
        .footer-divider {
          border: none;
          border-top: 1px solid #ddd;
          margin: 30px 0;
        }
        .email-footer {
          background-color: #f9f9f9;
          padding: 30px;
          border-top: 1px solid #eee;
          text-align: center;
        }
        .footer-text {
          color: #999;
          font-size: 12px;
          margin: 0;
        }
        .footer-links {
          margin-top: 15px;
        }
        .footer-links a {
          color: #10b981;
          text-decoration: none;
          font-size: 12px;
          margin: 0 10px;
        }
        @media (max-width: 600px) {
          .email-container {
            border-radius: 0;
          }
          .email-header {
            padding: 30px 15px;
          }
          .email-header h1 {
            font-size: 24px;
          }
          .email-body {
            padding: 20px 15px;
          }
          .cta-button {
            padding: 12px 30px;
            font-size: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="email-header">
          <div class="success-icon">✓</div>
          <h1>Account Approved!</h1>
          <p>Your partner account is now active</p>
        </div>

        <!-- Body -->
        <div class="email-body">
          <p class="greeting">Hello <strong>${ownerName}</strong>,</p>

          <p class="intro-text">
            Congratulations! Your partner account for <strong>${companyName}</strong> has been 
            reviewed and approved by our platform administrator. Your account is now fully active 
            and ready to use.
          </p>

          <!-- Features -->
          <div class="features-box">
            <p><strong>You can now:</strong></p>
            <p>✓ Add and manage service providers</p>
            <p>✓ Create and update services</p>
            <p>✓ View and manage customer bookings</p>
            <p>✓ Access your partner dashboard</p>
          </div>

          <!-- CTA Button -->
          <div class="button-container">
            <a href="${loginURL}" class="cta-button">Login to Your Dashboard</a>
          </div>

          <!-- Next Steps -->
          <div class="info-box">
            <p><strong>Next Steps:</strong></p>
            <p>1. Log in to your partner account using your credentials</p>
            <p>2. Complete your company profile</p>
            <p>3. Start adding your service providers</p>
            <p>4. Create service offerings and set pricing</p>
          </div>

          <!-- Support Info -->
          <p style="color: #666; font-size: 14px; line-height: 1.8;">
            If you need assistance, our support team is always available to help. 
            Feel free to reach out with any questions about managing your partner account.
          </p>

          <hr class="footer-divider">
        </div>

        <!-- Footer -->
        <div class="email-footer">
          <p class="footer-text">
            © ${new Date().getFullYear()} Appointment App. All rights reserved.
          </p>
          <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
            <a href="#">Contact Support</a>
          </div>
          <p class="footer-text" style="margin-top: 15px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

const getPartnerPasswordResetEmailHTML = (companyName, ownerName, resetLink) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .email-header {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          padding: 40px 20px;
          text-align: center;
          color: white;
        }
        .email-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .email-body {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .greeting strong {
          color: #f59e0b;
        }
        .intro-text {
          color: #555;
          margin-bottom: 30px;
          line-height: 1.8;
          font-size: 15px;
        }
        .warning-box {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 20px;
          margin: 30px 0;
          border-radius: 4px;
        }
        .warning-box p {
          margin: 0 0 10px 0;
          color: #92400e;
          font-size: 14px;
        }
        .warning-box p:last-child {
          margin-bottom: 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          padding: 14px 40px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          transition: opacity 0.3s ease;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .link-section {
          background-color: #f0f0f0;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
          word-break: break-all;
        }
        .link-section p {
          margin: 0 0 8px 0;
          color: #666;
          font-size: 13px;
          font-weight: 500;
        }
        .link-section a {
          color: #f59e0b;
          text-decoration: none;
          font-size: 12px;
          display: block;
          word-wrap: break-word;
        }
        .info-text {
          color: #888;
          font-size: 14px;
          margin: 20px 0;
          line-height: 1.6;
        }
        .security-tips {
          background-color: #f3f4f6;
          padding: 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .security-tips p {
          margin: 0 0 10px 0;
          color: #666;
          font-size: 14px;
        }
        .security-tips p:last-child {
          margin-bottom: 0;
        }
        .security-tips li {
          color: #666;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .expiry-badge {
          display: inline-block;
          background-color: #fef3c7;
          color: #92400e;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          margin: 10px 0;
        }
        .footer-divider {
          border: none;
          border-top: 1px solid #ddd;
          margin: 30px 0;
        }
        .email-footer {
          background-color: #f9f9f9;
          padding: 30px;
          border-top: 1px solid #eee;
          text-align: center;
        }
        .footer-text {
          color: #999;
          font-size: 12px;
          margin: 0;
        }
        .footer-links {
          margin-top: 15px;
        }
        .footer-links a {
          color: #f59e0b;
          text-decoration: none;
          font-size: 12px;
          margin: 0 10px;
        }
        @media (max-width: 600px) {
          .email-container {
            border-radius: 0;
          }
          .email-header {
            padding: 30px 15px;
          }
          .email-header h1 {
            font-size: 24px;
          }
          .email-body {
            padding: 20px 15px;
          }
          .cta-button {
            padding: 12px 30px;
            font-size: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="email-header">
          <h1>🔐 Reset Your Password</h1>
          <p>Follow the link below to set a new password</p>
        </div>

        <!-- Body -->
        <div class="email-body">
          <p class="greeting">Hello <strong>${ownerName}</strong>,</p>

          <p class="intro-text">
            We received a request to reset the password for your partner account associated with 
            <span style="color: #f59e0b; font-weight: 600;">${companyName}</span>. 
            If you didn't make this request, you can safely ignore this email.
          </p>

          <!-- Warning Box -->
          <div class="warning-box">
            <p><strong>⚠️ Security Notice:</strong></p>
            <p>This password reset link will expire in <strong>1 hour</strong>. If you didn't request this, 
            please ignore this email or contact our support team immediately.</p>
          </div>

          <!-- CTA Button -->
          <div class="button-container">
            <a href="${resetLink}" class="cta-button">Reset Your Password</a>
          </div>

          <!-- Alternative Link -->
          <div class="link-section">
            <p><strong>Or copy and paste this link in your browser:</strong></p>
            <a href="${resetLink}">${resetLink}</a>
          </div>

          <!-- Expiry Info -->
          <div style="text-align: center;">
            <span class="expiry-badge">⏱ This link expires in 1 hour</span>
          </div>

          <!-- Security Tips -->
          <div class="security-tips">
            <p><strong>🔒 Security Tips:</strong></p>
            <ul style="padding-left: 20px; margin: 10px 0;">
              <li>Never share this link with anyone</li>
              <li>Make sure your new password is strong and unique</li>
              <li>Use a combination of uppercase, lowercase, numbers, and symbols</li>
              <li>Never share your password with support staff</li>
            </ul>
          </div>

          <!-- Info Text -->
          <p class="info-text">
            If you didn't request a password reset, please ignore this email and your password will remain unchanged. 
            If you believe your account has been compromised, contact our support team immediately.
          </p>

          <hr class="footer-divider">

          <!-- Additional Help -->
          <p class="info-text">
            Need help? Contact our support team at any time. We're here to assist you with any account-related issues.
          </p>
        </div>

        <!-- Footer -->
        <div class="email-footer">
          <p class="footer-text">
            © ${new Date().getFullYear()} Appointment App. All rights reserved.
          </p>
          <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
            <a href="#">Contact Support</a>
          </div>
          <p class="footer-text" style="margin-top: 15px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

module.exports = {
  getPartnerVerificationEmailHTML,
  getPartnerApprovalEmailHTML,
  getPartnerPasswordResetEmailHTML,
}
