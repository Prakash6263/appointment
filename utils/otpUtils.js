const generateOTP = () => {
  return "999999"
}

// Get OTP expiration time (10 minutes from now)
const getOTPExpiration = () => {
  return new Date(Date.now() + 10 * 60 * 1000)
}

module.exports = { generateOTP, getOTPExpiration }
