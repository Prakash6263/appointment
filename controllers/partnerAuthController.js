const Partner = require("../models/Partner")
const Provider = require("../models/Provider")
const Service = require("../models/Service")
const Booking = require("../models/Booking")
const {
  generatePartnerToken,
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
} = require("../utils/tokenUtils")
const {
  sendPartnerVerificationEmail,
  sendPartnerApprovalEmail,
} = require("../utils/partnerEmailUtils")

// Register Partner
exports.registerPartner = async (req, res) => {
  try {
    const { companyName, ownerName, email, phone, password, confirmPassword } = req.body

    // Validation
    if (!companyName || !ownerName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      })
    }

    // Check if partner already exists
    const existingPartner = await Partner.findOne({ email: email.toLowerCase() })
    if (existingPartner) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      })
    }

    // Extract file paths if files are uploaded
    let logo = null
    let profileImage = null

    if (req.files) {
      if (req.files.logo) {
        logo = `/uploads/${req.files.logo[0].filename}`
      }
      if (req.files.profileImage) {
        profileImage = `/uploads/${req.files.profileImage[0].filename}`
      }
    }

    // Create partner
    const partner = new Partner({
      companyName,
      ownerName,
      email: email.toLowerCase(),
      phone,
      password,
      logo,
      profileImage,
      status: "PENDING",
    })

    await partner.save()

    // Generate verification token
    const verificationToken = generateEmailVerificationToken(partner._id, partner.email)

    // Update partner with token
    partner.emailVerificationToken = verificationToken
    partner.emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await partner.save()

    // Send verification email with token (email utility will generate link from BACKEND_BASE_URL)
    await sendPartnerVerificationEmail(partner.email, partner.companyName, partner.ownerName, verificationToken)

    res.status(201).json({
      success: true,
      message: "Partner registered successfully. Please check your email to verify.",
      partnerId: partner._id,
      partner: {
        _id: partner._id,
        companyName: partner.companyName,
        email: partner.email,
        logo: partner.logo,
        profileImage: partner.profileImage,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    })
  }
}

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params

    const decoded = verifyEmailVerificationToken(token)
    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      })
    }

    const partner = await Partner.findById(decoded.partnerId)
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    if (partner.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      })
    }

    // Mark email as verified
    partner.isEmailVerified = true
    partner.emailVerificationToken = undefined
    partner.emailVerificationTokenExpires = undefined
    await partner.save()

    res.json({
      success: true,
      message: "Email verified successfully. Waiting for admin approval.",
    })
  } catch (error) {
    console.error("Verification error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Verification failed",
    })
  }
}

// Login Partner
exports.loginPartner = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      })
    }

    // Find partner
    const partner = await Partner.findOne({ email: email.toLowerCase() }).select("+password")
    if (!partner) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check status
    if (partner.status !== "VERIFIED") {
      return res.status(403).json({
        success: false,
        message: `Partner account status is ${partner.status}. Only verified partners can login.`,
      })
    }

    // Check password
    const isPasswordValid = await partner.matchPassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Generate token
    const token = generatePartnerToken(partner._id, partner._id, partner.email)

    res.json({
      success: true,
      message: "Login successful",
      token,
      partner: {
        _id: partner._id,
        companyName: partner.companyName,
        email: partner.email,
        status: partner.status,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    })
  }
}

// Get Partner Profile
exports.getProfile = async (req, res) => {
  try {
    const partner = await Partner.findById(req.partnerId)
      .populate("providers")
      .populate("services")

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    res.json({
      success: true,
      partner,
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get profile",
    })
  }
}

// Update Partner Profile
exports.updateProfile = async (req, res) => {
  try {
    const { companyName, ownerName, phone } = req.body

    const updateData = {
      companyName,
      ownerName,
      phone,
    }

    // Handle file uploads if present
    if (req.files) {
      if (req.files.logo) {
        updateData.logo = `/uploads/${req.files.logo[0].filename}`
      }
      if (req.files.profileImage) {
        updateData.profileImage = `/uploads/${req.files.profileImage[0].filename}`
      }
    }

    const partner = await Partner.findByIdAndUpdate(req.partnerId, updateData, {
      new: true,
      runValidators: true,
    })

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      partner,
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    })
  }
}
