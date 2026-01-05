const { body, validationResult } = require("express-validator")

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation errors",
      errors: errors.array(),
    })
  }
  next()
}

// Signup validation rules
const signupValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  body("username").isLength({ min: 3 }).trim().withMessage("Username must be at least 3 characters"),
  body("phoneNumber")
  .matches(/^\+?[1-9]\d{7,14}$/)
  .withMessage("Invalid phone number"),

  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(["customer", "provider"]).withMessage("Role must be customer or provider"),
  body("firstName").if(body("role").equals("customer")).notEmpty().withMessage("First name is required for customers"),
  body("lastName").if(body("role").equals("customer")).notEmpty().withMessage("Last name is required for customers"),
  // body("businessName")
  //   .if(body("role").equals("provider"))
  //   .notEmpty()
  //   .withMessage("Business name is required for providers"),
  // body("businessCategory")
  //   .if(body("role").equals("provider"))
  //   .notEmpty()
  //   .withMessage("Business category is required for providers"),
]

// OTP verification validation
const verifyOTPValidation = [
  body("userId").isMongoId().withMessage("Invalid user ID"),
  body("otp").isLength({ min: 6, max: 6 }).isNumeric().withMessage("OTP must be 6 digits"),
]

// Resend OTP validation
const resendOTPValidation = [body("email").isEmail().normalizeEmail().withMessage("Invalid email")]

// Login validation
const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
]

const forgotPasswordValidation = [body("email").isEmail().normalizeEmail().withMessage("Invalid email")]

const verifyResetOTPValidation = [
  body("userId").isMongoId().withMessage("Invalid user ID"),
  body("otp").isLength({ min: 6, max: 6 }).isNumeric().withMessage("OTP must be 6 digits"),
]

const resetPasswordValidation = [
  body("userId").isMongoId().withMessage("Invalid user ID"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  body("confirmPassword").isLength({ min: 6 }).withMessage("Confirm password must be at least 6 characters"),
]

const editProfileValidation = [
  body("firstName").optional().notEmpty().withMessage("First name cannot be empty"),
  body("lastName").optional().notEmpty().withMessage("Last name cannot be empty"),
  body("businessName").optional().notEmpty().withMessage("Business name cannot be empty"),
  body("businessCategory").optional().notEmpty().withMessage("Business category cannot be empty"),
  body("contact").optional().notEmpty().withMessage("Contact cannot be empty"),
  body("address").optional().notEmpty().withMessage("Address cannot be empty"),
  body("email").optional().isEmail().normalizeEmail().withMessage("Invalid email"),
]

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
