const express = require("express")
const {
  signup,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  editProfile,
  googleCallback,
} = require("../controllers/authController")
const {
  handleValidationErrors,
  signupValidation,
  verifyOTPValidation,
  resendOTPValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyResetOTPValidation,
  resetPasswordValidation,
  editProfileValidation,
} = require("../middleware/validation")
const upload = require("../middleware/multer")

const router = express.Router()

router.post("/signup", signupValidation, handleValidationErrors, signup)
router.post("/verify-otp", verifyOTPValidation, handleValidationErrors, verifyOTP)
router.post("/resend-otp", resendOTPValidation, handleValidationErrors, resendOTP)
router.post("/login", loginValidation, handleValidationErrors, login)

router.post("/forgot-password", forgotPasswordValidation, handleValidationErrors, forgotPassword)
router.post("/verify-reset-otp", verifyResetOTPValidation, handleValidationErrors, verifyResetOTP)
router.post("/reset-password", resetPasswordValidation, handleValidationErrors, resetPassword)

router.put(
  "/edit-profile/:userId",
  upload.single("profileImage"),
  editProfileValidation,
  handleValidationErrors,
  editProfile,
)

router.post("/google-auth", googleCallback)

module.exports = router
