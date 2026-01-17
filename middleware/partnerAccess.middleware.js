const Partner = require("../models/Partner")

// Middleware to ensure partner isolation
const ensurePartnerAccess = async (req, res, next) => {
  try {
    const { userId } = req

    // Find partner associated with this user
    const partner = await Partner.findOne({ ownerUserId: userId })

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found. Please create a partner account first.",
      })
    }

    // Attach partner to request for authorization checks
    req.partner = partner

    next()
  } catch (error) {
    console.error("Partner access error:", error)
    res.status(500).json({
      success: false,
      message: "Partner access validation failed",
    })
  }
}

module.exports = { ensurePartnerAccess }
