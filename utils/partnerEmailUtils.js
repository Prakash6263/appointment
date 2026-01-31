const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

const sendPartnerVerificationEmail = async (email, companyName, verificationLink) => {
  const mailOptions = {
    from: `"Appointment App" <${process.env.GMAIL_EMAIL}>`,
    to: email,
    subject: "Partner Email Verification",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Partner Email Verification</h2>
        <p>Hi ${companyName},</p>
        <p>Thank you for registering as a partner. Please verify your email by clicking the link below:</p>
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
          <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #00796b; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
        </div>
        <p style="color: #666;">Or copy and paste this link in your browser:</p>
        <p style="color: #666; word-break: break-all;">${verificationLink}</p>
        <p style="color: #666;">This link will expire in 24 hours.</p>
        <p style="color: #666;">If you didn't register for this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Do not share this link with anyone.</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Email sending error:", error)
    throw new Error("Failed to send verification email")
  }
}

const sendPartnerApprovalEmail = async (email, companyName) => {
  const mailOptions = {
    from: `"Appointment App" <${process.env.GMAIL_EMAIL}>`,
    to: email,
    subject: "Partner Account Approved",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Partner Account Approved</h2>
        <p>Hi ${companyName},</p>
        <p>Congratulations! Your partner account has been approved by the platform administrator.</p>
        <p style="color: #666;">You can now log in and start managing your providers, services, and bookings.</p>
        <p style="color: #666;">Thank you for partnering with us!</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">If you have any questions, please contact our support team.</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Email sending error:", error)
    throw new Error("Failed to send approval email")
  }
}

module.exports = {
  sendPartnerVerificationEmail,
  sendPartnerApprovalEmail,
}
