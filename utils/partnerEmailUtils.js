const nodemailer = require("nodemailer")
const { getPartnerVerificationEmailHTML, getPartnerApprovalEmailHTML, getPartnerPasswordResetEmailHTML } = require("./emailTemplates")

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Generate verification link with environment variables
const generateVerificationLink = (token) => {
  const baseURL = process.env.BACKEND_BASE_URL
  return `${baseURL}/api/partner/verify-email/${token}`
}

// Generate login URL with environment variables
const generateLoginURL = () => {
  const frontendURL = process.env.FRONTEND_BASE_URL
  return `${frontendURL}/partner/login`
}

// Generate password reset link with environment variables
const generatePasswordResetLink = (token) => {
  const baseURL = process.env.BACKEND_BASE_URL
  return `${baseURL}/api/partner/reset-password/${token}`
}

const sendPartnerVerificationEmail = async (email, companyName, ownerName, token) => {
  const verificationLink = generateVerificationLink(token)
  const htmlContent = getPartnerVerificationEmailHTML(companyName, verificationLink, ownerName)

  const mailOptions = {
    from: `"Appointment App" <${process.env.GMAIL_EMAIL}>`,
    to: email,
    subject: "Verify Your Partner Account - Appointment App",
    html: htmlContent,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`[v0] Verification email sent to ${email}`)
    return true
  } catch (error) {
    console.error("[v0] Email sending error:", error)
    throw new Error("Failed to send verification email")
  }
}

const sendPartnerApprovalEmail = async (email, companyName, ownerName) => {
  const loginURL = generateLoginURL()
  const htmlContent = getPartnerApprovalEmailHTML(companyName, ownerName, loginURL)

  const mailOptions = {
    from: `"Appointment App" <${process.env.GMAIL_EMAIL}>`,
    to: email,
    subject: "Your Partner Account Has Been Approved - Appointment App",
    html: htmlContent,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`[v0] Approval email sent to ${email}`)
    return true
  } catch (error) {
    console.error("[v0] Email sending error:", error)
    throw new Error("Failed to send approval email")
  }
}

const sendPartnerPasswordResetEmail = async (email, companyName, ownerName, otp) => {
  const htmlContent = getPartnerPasswordResetEmailHTML(companyName, ownerName, otp)

  const mailOptions = {
    from: `"Appointment App" <${process.env.GMAIL_EMAIL}>`,
    to: email,
    subject: "Reset Your Partner Account Password - Appointment App",
    html: htmlContent,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`[v0] Password reset OTP email sent to ${email}`)
    return true
  } catch (error) {
    console.error("[v0] Email sending error:", error)
    throw new Error("Failed to send password reset email")
  }
}

module.exports = {
  sendPartnerVerificationEmail,
  sendPartnerApprovalEmail,
  generateVerificationLink,
  generateLoginURL,
  generatePasswordResetLink,
  sendPartnerPasswordResetEmail,
}
