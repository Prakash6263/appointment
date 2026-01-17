const Partner = require("../models/Partner")

// Middleware to validate partner license
const validateLicense = async (req, res, next) => {
  try {
    const { userId } = req

    // Find partner associated with this user
    const partner = await Partner.findOne({ ownerUserId: userId })

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    // Check if license is active
    if (!partner.license.isActive) {
      return res.status(403).json({
        success: false,
        message: "License is inactive",
      })
    }

    // Check if license has expired
    if (partner.license.expiresAt && new Date() > new Date(partner.license.expiresAt)) {
      partner.license.isActive = false
      await partner.save()
      return res.status(403).json({
        success: false,
        message: "License has expired",
      })
    }

    // Check if partner is active
    if (!partner.isActive) {
      return res.status(403).json({
        success: false,
        message: "Partner account is inactive",
      })
    }

    // Attach partner to request
    req.partner = partner

    next()
  } catch (error) {
    console.error("License validation error:", error)
    res.status(500).json({
      success: false,
      message: "License validation failed",
    })
  }
}

module.exports = { validateLicense }
