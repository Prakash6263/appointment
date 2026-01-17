const Partner = require("../models/Partner")

// Add Domain
exports.addDomain = async (req, res) => {
  try {
    const { userId } = req
    const { domainType, domain } = req.body

    if (!domainType || !domain) {
      return res.status(400).json({
        success: false,
        message: "Domain type and domain are required",
      })
    }

    // Find partner
    const partner = await Partner.findOne({ ownerUserId: userId })
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    // Check if domain is already taken
    const existingDomain = await Partner.findOne({
      "domain.domain": domain,
      _id: { $ne: partner._id },
    })
    if (existingDomain) {
      return res.status(400).json({
        success: false,
        message: "Domain is already taken",
      })
    }

    // Update domain
    partner.domain.type = domainType
    partner.domain.domain = domain
    partner.domain.verificationStatus = "PENDING"
    partner.domain.sslStatus = "PENDING"

    await partner.save()

    res.json({
      success: true,
      message: "Domain added successfully",
      data: partner.domain,
    })
  } catch (error) {
    console.error("Add domain error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add domain",
    })
  }
}

// Verify Domain
exports.verifyDomain = async (req, res) => {
  try {
    const { userId } = req

    // Find partner
    const partner = await Partner.findOne({ ownerUserId: userId })
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    if (!partner.domain.domain) {
      return res.status(400).json({
        success: false,
        message: "No domain configured",
      })
    }

    // Simulate domain verification
    partner.domain.verificationStatus = "VERIFIED"
    partner.domain.sslStatus = "ACTIVE"

    await partner.save()

    res.json({
      success: true,
      message: "Domain verified successfully",
      data: partner.domain,
    })
  } catch (error) {
    console.error("Verify domain error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to verify domain",
    })
  }
}
