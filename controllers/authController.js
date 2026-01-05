const User = require("../models/User")
const { sendOTPEmail, sendPasswordResetEmail } = require("../services/emailService")
const { generateOTP, getOTPExpiration } = require("../utils/otpUtils")
const jwt = require("jsonwebtoken")
const fs = require("fs")
const path = require("path")

// Signup Controller
exports.signup = async (req, res) => {
  try {
    const { email, username, phoneNumber, password, role } = req.body

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] })
    if (user) {
      return res.status(400).json({
        success: false,
        message: "Email or username already registered",
      })
    }

    // Generate OTP
    const otp = generateOTP()
    const otpExpires = getOTPExpiration()

    // Create user object based on role
    const userData = {
      email,
      username,
      phoneNumber,
      password,
      role,
      otp,
      otpExpires,
      isEmailVerified: false,
    }

    // Create user
    user = new User(userData)
    await user.save()

    // Send OTP email
    const displayName = username || email
    await sendOTPEmail(email, otp, displayName)

    res.status(201).json({
      success: true,
      message: "Signup successful. Please verify your email with OTP",
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Signup failed",
    })
  }
}

// Verify OTP Controller
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Check if OTP is expired
    if (!user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one",
      })
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      })
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true
    user.otp = null
    user.otpExpires = null
    await user.save()

    res.json({
      success: true,
      message: "Email verified successfully",
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("OTP verification error:", error)
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    })
  }
}

// Resend OTP Controller
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Generate new OTP
    const otp = generateOTP()
    const otpExpires = getOTPExpiration()

    user.otp = otp
    user.otpExpires = otpExpires
    await user.save()

    // Send OTP email
    const displayName = user.username || user.email
    await sendOTPEmail(email, otp, displayName)

    res.json({
      success: true,
      message: "OTP sent to your email",
      data: {
        userId: user._id,
      },
    })
  } catch (error) {
    console.error("Resend OTP error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    })
  }
}

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email }).select("+password")
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check email verification
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      })
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    })

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: user.toJSON(),
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Login failed",
    })
  }
}

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Generate password reset OTP
    const otp = generateOTP()
    const otpExpires = getOTPExpiration()

    user.resetPasswordOtp = otp
    user.resetPasswordOtpExpires = otpExpires
    await user.save()

    // Send password reset email
    const displayName = user.username || user.email
    await sendPasswordResetEmail(email, otp, displayName)

    res.json({
      success: true,
      message: "Password reset OTP sent to your email",
      data: {
        userId: user._id,
      },
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to send password reset email",
    })
  }
}

exports.verifyResetOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Check if OTP is expired
    if (!user.resetPasswordOtpExpires || new Date() > user.resetPasswordOtpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one",
      })
    }

    // Verify OTP
    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      })
    }

    res.json({
      success: true,
      message: "OTP verified successfully",
      data: {
        userId: user._id,
      },
    })
  } catch (error) {
    console.error("Reset OTP verification error:", error)
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { userId, newPassword, confirmPassword } = req.body

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      })
    }

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Update password and clear reset OTP
    user.password = newPassword
    user.resetPasswordOtp = null
    user.resetPasswordOtpExpires = null
    await user.save()

    res.json({
      success: true,
      message: "Password reset successfully",
      data: {
        userId: user._id,
      },
    })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
    })
  }
}

exports.editProfile = async (req, res) => {
  try {
    const { userId } = req.params
    const { contact, address, email } = req.body

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Update common fields
    if (contact) user.contact = contact
    if (address) user.address = address
    if (email && email !== user.email) {
      // Check if new email is already taken
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        })
      }
      user.email = email
    }

    if (req.file) {
      // Delete old profile image if exists
      if (user.profileImage) {
        const oldImagePath = path.join(__dirname, "../uploads", path.basename(user.profileImage))
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }
      // Store new image path
      user.profileImage = `/uploads/${req.file.filename}`
    }

    await user.save()

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: user.toJSON(),
      },
    })
  } catch (error) {
    console.error("Edit profile error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    })
  }
}

exports.googleCallback = async (req, res) => {
  try {
    const { googleId, email, role } = req.body

    // Check if user exists
    let user = await User.findOne({ $or: [{ googleId }, { email }] })

    if (user) {
      // Update existing user if email changed
      if (user.email !== email) {
        user.email = email
      }
      // Mark email as verified for Google OAuth users
      user.isEmailVerified = true
      await user.save()
    } else {
      // Create new user for Google OAuth
      if (!role) {
        return res.status(400).json({
          success: false,
          message: "Role is required for new user registration",
        })
      }

      user = new User({
        email,
        googleId,
        role,
        isEmailVerified: true,
      })

      await user.save()
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    })

    res.json({
      success: true,
      message: "Google login successful",
      data: {
        token,
        user: user.toJSON(),
      },
    })
  } catch (error) {
    console.error("Google callback error:", error)
    res.status(500).json({
      success: false,
      message: "Google authentication failed",
    })
  }
}
