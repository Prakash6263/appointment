const nodemailer = require("nodemailer")
const { getPartnerVerificationEmailHTML, getPartnerApprovalEmailHTML } = require("./emailTemplates")

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
  const baseURL = process.env.BACKEND_BASE_URL || "http://localhost:5000"
  return `${baseURL}/api/partner/verify-email/${token}`
}

// Generate login URL with environment variables
const generateLoginURL = () => {
  const frontendURL = process.env.FRONTEND_BASE_URL || "http://localhost:3000"
  return `${frontendURL}/partner/login`
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

module.exports = {
  sendPartnerVerificationEmail,
  sendPartnerApprovalEmail,
  generateVerificationLink,
  generateLoginURL,
}
