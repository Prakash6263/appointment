const { body, validationResult } = require("express-validator")

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    })
  }
  next()
}

// Signup validation rules
const signupValidation = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("username").notEmpty().withMessage("Username is required"),
  body("phoneNumber").notEmpty().withMessage("Phone number is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(["customer", "provider"]).withMessage("Invalid role"),
]

// OTP verification validation
const verifyOTPValidation = [
  body("userId").isMongoId().withMessage("Invalid user reference"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
]

// Resend OTP validation
const resendOTPValidation = [body("email").isEmail().withMessage("Invalid email address")]

// Login validation
const loginValidation = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required"),
]

const forgotPasswordValidation = [body("email").isEmail().withMessage("Invalid email address")]

const verifyResetOTPValidation = [
  body("userId").isMongoId().withMessage("Invalid user reference"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
]

const resetPasswordValidation = [
  body("userId").isMongoId().withMessage("Invalid user reference"),
  body("newPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("confirmPassword").notEmpty().withMessage("Please confirm your password"),
]

const editProfileValidation = [body("email").optional().isEmail().withMessage("Invalid email address")]

module.exports = {
  handleValidationErrors,
  signupValidation,
  verifyOTPValidation,
  resendOTPValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyResetOTPValidation,
  resetPasswordValidation,
  editProfileValidation,
}
