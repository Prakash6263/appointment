const Partner = require("../models/Partner")
const Plan = require("../models/Plan")
const limitService = require("../services/limitService")

// Get Partner License
exports.getPartnerLicense = async (req, res) => {
  try {
    const { userId } = req

    const partner = await Partner.findOne({ ownerUserId: userId }).populate("license.planId")
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    // Get limit info
    const limitInfo = await limitService.getPartnerLimitInfo(partner._id)

    res.json({
      success: true,
      message: "License retrieved successfully",
      data: {
        license: partner.license,
        plan: partner.license.planId,
        limits: limitInfo.limits,
      },
    })
  } catch (error) {
    console.error("Get license error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get license",
    })
  }
}

// Upgrade Partner License
exports.upgradeLicense = async (req, res) => {
  try {
    const { userId } = req
    const { planId } = req.body

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
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

    // Find plan
    const plan = await Plan.findById(planId)
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      })
    }

    // Check if plan is active
    if (!plan.isActive) {
      return res.status(400).json({
        success: false,
        message: "Plan is not available",
      })
    }

    // Update license
    partner.license.planId = planId
    partner.license.planType = "PAID"
    partner.license.customerLimit = plan.customerLimit
    partner.license.providerLimit = plan.providerLimit
    partner.license.isActive = true

    // Set expiration to 1 year from now
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)
    partner.license.expiresAt = expiresAt

    await partner.save()

    // Get limit info
    const limitInfo = await limitService.getPartnerLimitInfo(partner._id)

    res.json({
      success: true,
      message: "License upgraded successfully",
      data: {
        license: partner.license,
        limits: limitInfo.limits,
      },
    })
  } catch (error) {
    console.error("Upgrade license error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upgrade license",
    })
  }
}
