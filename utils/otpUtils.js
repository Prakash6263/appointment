// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Get OTP expiration time (10 minutes from now)
const getOTPExpiration = () => {
  return new Date(Date.now() + 10 * 60 * 1000)
}

module.exports = { generateOTP, getOTPExpiration }
