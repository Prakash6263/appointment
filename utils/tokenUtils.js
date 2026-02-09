const jwt = require("jsonwebtoken")

const generatePartnerToken = (partnerId, userId, email) => {
  return jwt.sign(
    {
      partnerId,
      userId,
      email,
      role: "PARTNER",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  )
}

const generateEmailVerificationToken = (partnerId, email) => {
  return jwt.sign(
    {
      partnerId,
      email,
      type: "email_verification",
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  )
}

const verifyEmailVerificationToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.type !== "email_verification") {
      throw new Error("Invalid token type")
    }
    return decoded
  } catch (error) {
    return null
  }
}

const generatePasswordResetToken = (partnerId, email) => {
  return jwt.sign(
    {
      partnerId,
      email,
      type: "password_reset",
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  )
}

const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.type !== "password_reset") {
      throw new Error("Invalid token type")
    }
    return decoded
  } catch (error) {
    return null
  }
}

// Generate OTP for password reset
const generatePasswordResetOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString() // 6-digit OTP
}

module.exports = {
  generatePartnerToken,
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  generatePasswordResetOTP,
}
