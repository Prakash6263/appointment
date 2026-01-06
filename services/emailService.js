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

// Send OTP email
const sendOTPEmail = async (email, otp, userName) => {
  const mailOptions = {
    from: `"Appointment App" <${process.env.GMAIL_EMAIL}>`,
    to: email,
    subject: "Email Verification - Your OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Hi ${userName},</p>
        <p>Your OTP code for email verification is:</p>
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
          <h1 style="color: #00796b; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #666;">This code will expire in 10 minutes.</p>
        <p style="color: #666;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Do not share this OTP with anyone.</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Email sending error:", error)
    throw new Error("Failed to send OTP email")
  }
}

const sendPasswordResetEmail = async (email, otp, userName) => {
  const mailOptions = {
    from: `"Appointment App" <${process.env.GMAIL_EMAIL}>`,
    to: email,
    subject: "Password Reset - Your OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi ${userName},</p>
        <p>You requested to reset your password. Your OTP code is:</p>
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
          <h1 style="color: #00796b; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #666;">This code will expire in 10 minutes.</p>
        <p style="color: #666;">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Do not share this OTP with anyone.</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Email sending error:", error)
    throw new Error("Failed to send password reset email")
  }
}

module.exports = { sendOTPEmail, sendPasswordResetEmail }
