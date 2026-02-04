const Partner = require("../models/Partner")
const { verifyEmailVerificationToken } = require("../utils/tokenUtils")

// Serve verification page with HTML
exports.verifyEmailPage = async (req, res) => {
  try {
    const { token } = req.params

    console.log("[v0] Email verification page accessed with token:", token)

    // Verify the token format first
    const decoded = verifyEmailVerificationToken(token)
    if (!decoded) {
      return res.status(400).send(getInvalidTokenHTML())
    }

    // Find the partner
    const partner = await Partner.findById(decoded.partnerId)
    if (!partner) {
      return res.status(404).send(getPartnerNotFoundHTML())
    }

    // Check if already verified
    if (partner.isEmailVerified) {
      return res.status(200).send(getAlreadyVerifiedHTML(partner.companyName, partner.ownerName))
    }

    // Token is valid and partner exists - show the verification page with option to verify
    return res.status(200).send(
      getVerificationPageHTML(
        token,
        partner.companyName,
        partner.ownerName,
        partner.email,
        process.env.BACKEND_BASE_URL
      ),
    )
  } catch (error) {
    console.error("[v0] Verification page error:", error)
    return res.status(500).send(getErrorHTML(error.message))
  }
}

// Handle verification confirmation from the form
exports.confirmVerifyEmail = async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required"
      })
    }

    // Verify the token
    const decoded = verifyEmailVerificationToken(token)
    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      })
    }

    // Find partner
    const partner = await Partner.findById(decoded.partnerId)
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found"
      })
    }

    // Check if already verified
    if (partner.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: "Email already verified",
        alreadyVerified: true,
        companyName: partner.companyName,
        ownerName: partner.ownerName
      })
    }

    // Mark email as verified
    partner.isEmailVerified = true
    partner.emailVerificationToken = undefined
    partner.emailVerificationTokenExpires = undefined
    await partner.save()

    console.log("[v0] Email verified for partner:", partner._id, "Email:", partner.email)

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      companyName: partner.companyName,
      ownerName: partner.ownerName
    })
  } catch (error) {
    console.error("[v0] Verification confirmation error:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Verification failed"
    })
  }
}

// HTML Templates

function getVerificationPageHTML(token, companyName, ownerName, email, backendURL) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Partner Account</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          max-width: 500px;
          width: 100%;
          padding: 40px;
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header .icon {
          font-size: 48px;
          margin-bottom: 15px;
          display: block;
        }
        .header h1 {
          color: #333;
          font-size: 28px;
          margin-bottom: 10px;
          font-weight: 600;
        }
        .header p {
          color: #666;
          font-size: 14px;
          line-height: 1.6;
        }
        .content {
          margin: 30px 0;
        }
        .info-box {
          background: #f5f7fa;
          border-left: 4px solid #667eea;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        .info-box p {
          color: #555;
          font-size: 14px;
          margin: 8px 0;
        }
        .info-box strong {
          color: #333;
        }
        .company-details {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
          font-size: 14px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: #666;
          font-weight: 500;
        }
        .detail-value {
          color: #333;
          word-break: break-all;
        }
        .actions {
          display: flex;
          gap: 10px;
          margin-top: 30px;
        }
        .btn {
          flex: 1;
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
          text-align: center;
        }
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }
        .btn-secondary {
          background: #e0e0e0;
          color: #333;
        }
        .btn-secondary:hover {
          background: #d0d0d0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #999;
          font-size: 12px;
        }
        .footer p {
          margin: 5px 0;
        }
        .loading {
          display: none;
          text-align: center;
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .message {
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .success-message {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .error-message {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        .warning-text {
          color: #f0ad4e;
          font-size: 13px;
          margin-top: 15px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="icon">✓</span>
          <h1>Verify Your Email</h1>
          <p>Complete your partner account verification</p>
        </div>

        <div class="content">
          <div class="info-box">
            <p>
              <strong>Welcome to our Partner Program!</strong><br>
              Click the button below to verify your email address and activate your partner account.
            </p>
          </div>

          <div class="company-details">
            <div class="detail-row">
              <span class="detail-label">Company:</span>
              <span class="detail-value">${companyName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Owner:</span>
              <span class="detail-value">${ownerName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${email}</span>
            </div>
          </div>

          <div class="info-box" style="background: #fff3cd; border-left-color: #ffc107; color: #856404;">
            <p>
              <strong>⏱ This verification link expires in 24 hours.</strong><br>
              Please complete your verification before the link expires.
            </p>
          </div>

          <div id="loading" class="loading">
            <div class="spinner"></div>
            <p>Verifying your email...</p>
          </div>

          <div id="content">
            <div class="actions">
              <button id="verifyBtn" class="btn btn-primary" onclick="verifyEmail()">Verify Email</button>
              <button class="btn btn-secondary" onclick="goHome()">Cancel</button>
            </div>
          </div>

          <div id="message"></div>

          <p class="warning-text">
            Never share this verification link with anyone. If you didn't create this account, please ignore this email.
          </p>
        </div>

        <div class="footer">
          <p>© 2025 Appointment App. All rights reserved.</p>
          <p>This is an automated message. Please do not reply.</p>
        </div>
      </div>

      <script>
        const token = '${token}';

        async function verifyEmail() {
          const verifyBtn = document.getElementById('verifyBtn');
          const loading = document.getElementById('loading');
          const content = document.getElementById('content');
          const messageDiv = document.getElementById('message');

          verifyBtn.disabled = true;
          loading.style.display = 'block';
          content.style.display = 'none';
          messageDiv.innerHTML = '';

          try {
            const response = await fetch('${backendURL}/api/partner/confirm-verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token: token }),
            });

            const data = await response.json();

            loading.style.display = 'none';

            if (data.success) {
              messageDiv.innerHTML = \`
                <div class="message success-message">
                  <strong>✓ Email Verified Successfully!</strong><br>
                  Your email has been verified. Our team will review your account and send you an approval notification within 24-48 hours.
                </div>
              \`;
              
              setTimeout(() => {
                window.location.href = '${process.env.FRONTEND_BASE_URL || "http://localhost:3000"}/partner/login';
              }, 2000);
            } else {
              messageDiv.innerHTML = \`
                <div class="message error-message">
                  <strong>✗ Verification Failed</strong><br>
                  \${data.message || 'An error occurred during verification'}
                </div>
              \`;
              content.style.display = 'block';
              verifyBtn.disabled = false;
            }
          } catch (error) {
            console.error('[v0] Fetch error:', error);
            loading.style.display = 'none';
            content.style.display = 'block';
            verifyBtn.disabled = false;
            messageDiv.innerHTML = \`
              <div class="message error-message">
                <strong>✗ Connection Error</strong><br>
                Could not connect to the server. Please try again later.
              </div>
            \`;
          }
        }

        function goHome() {
          window.location.href = '${process.env.FRONTEND_BASE_URL || "http://localhost:3000"}';
        }
      </script>
    </body>
    </html>
  `
}

function getInvalidTokenHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invalid Token</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          max-width: 500px;
          width: 100%;
          padding: 40px;
          text-align: center;
        }
        .icon {
          font-size: 48px;
          display: block;
          margin-bottom: 15px;
        }
        h1 {
          color: #d32f2f;
          margin-bottom: 15px;
        }
        p {
          color: #666;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .btn {
          display: inline-block;
          padding: 12px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          transition: background 0.3s ease;
        }
        .btn:hover {
          background: #764ba2;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <span class="icon">✗</span>
        <h1>Invalid or Expired Token</h1>
        <p>
          The verification link you clicked is invalid or has expired. 
          Verification links are valid for 24 hours. Please request a new verification link.
        </p>
        <a href="/" class="btn">Go to Homepage</a>
      </div>
    </body>
    </html>
  `
}

function getPartnerNotFoundHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Partner Not Found</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          max-width: 500px;
          width: 100%;
          padding: 40px;
          text-align: center;
        }
        .icon {
          font-size: 48px;
          display: block;
          margin-bottom: 15px;
        }
        h1 {
          color: #d32f2f;
          margin-bottom: 15px;
        }
        p {
          color: #666;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .btn {
          display: inline-block;
          padding: 12px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          transition: background 0.3s ease;
        }
        .btn:hover {
          background: #764ba2;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <span class="icon">⚠</span>
        <h1>Partner Account Not Found</h1>
        <p>
          The partner account associated with this verification link could not be found. 
          Please contact support if you believe this is an error.
        </p>
        <a href="/" class="btn">Go to Homepage</a>
      </div>
    </body>
    </html>
  `
}

function getAlreadyVerifiedHTML(companyName, ownerName) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Already Verified</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          max-width: 500px;
          width: 100%;
          padding: 40px;
          text-align: center;
        }
        .icon {
          font-size: 48px;
          display: block;
          margin-bottom: 15px;
        }
        h1 {
          color: #10b981;
          margin-bottom: 15px;
        }
        p {
          color: #666;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .btn {
          display: inline-block;
          padding: 12px 30px;
          background: #10b981;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          transition: background 0.3s ease;
        }
        .btn:hover {
          background: #059669;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <span class="icon">✓</span>
        <h1>Already Verified</h1>
        <p>
          Hello ${ownerName},<br><br>
          The email for <strong>${companyName}</strong> has already been verified. 
          Your account is now waiting for administrator approval. 
          You'll receive an email notification as soon as your account is approved.
        </p>
        <a href="/" class="btn">Go to Homepage</a>
      </div>
    </body>
    </html>
  `
}

function getErrorHTML(errorMessage) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Error</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          max-width: 500px;
          width: 100%;
          padding: 40px;
          text-align: center;
        }
        .icon {
          font-size: 48px;
          display: block;
          margin-bottom: 15px;
        }
        h1 {
          color: #d32f2f;
          margin-bottom: 15px;
        }
        p {
          color: #666;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .error-details {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 6px;
          text-align: left;
          font-size: 13px;
          color: #666;
          margin-bottom: 30px;
          word-break: break-word;
        }
        .btn {
          display: inline-block;
          padding: 12px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          transition: background 0.3s ease;
        }
        .btn:hover {
          background: #764ba2;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <span class="icon">⚠</span>
        <h1>An Error Occurred</h1>
        <p>We encountered an error while processing your verification request.</p>
        <div class="error-details">
          ${errorMessage}
        </div>
        <a href="/" class="btn">Go to Homepage</a>
      </div>
    </body>
    </html>
  `
}

function getSuccessVerificationHTML(companyName, ownerName, email, frontendURL) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verified</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          max-width: 500px;
          width: 100%;
          padding: 40px;
          text-align: center;
        }
        .icon {
          font-size: 48px;
          display: block;
          margin-bottom: 15px;
        }
        h1 {
          color: #10b981;
          margin-bottom: 15px;
        }
        p {
          color: #666;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .btn {
          display: inline-block;
          padding: 12px 30px;
          background: #10b981;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          transition: background 0.3s ease;
        }
        .btn:hover {
          background: #059669;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <span class="icon">✓</span>
        <h1>Email Verified Successfully</h1>
        <p>
          Hello ${ownerName},<br><br>
          The email for <strong>${companyName}</strong> has been verified successfully. 
          Your account is now waiting for administrator approval. 
          You'll receive an email notification as soon as your account is approved.
        </p>
        <a href="${frontendURL}/partner/login" class="btn">Go to Login</a>
      </div>
    </body>
    </html>
  `
}
