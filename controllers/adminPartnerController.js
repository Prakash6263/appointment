const Partner = require("../models/Partner")
const { sendPartnerApprovalEmail } = require("../utils/partnerEmailUtils")

// Get All Partners
exports.getAllPartners = async (req, res) => {
  try {
    const { status } = req.query

    let query = {}
    if (status) {
      query.status = status
    }

    const partners = await Partner.find(query)
      .populate("providers")
      .populate("services")
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      count: partners.length,
      partners,
    })
  } catch (error) {
    console.error("Get all partners error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get partners",
    })
  }
}

// Get Partner Details
exports.getPartnerDetails = async (req, res) => {
  try {
    const { id } = req.params

    const partner = await Partner.findById(id)
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
    console.error("Get partner details error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get partner details",
    })
  }
}

// Approve Partner
exports.approvePartner = async (req, res) => {
  try {
    const { id } = req.params

    const partner = await Partner.findById(id)
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    if (partner.status === "VERIFIED") {
      return res.status(400).json({
        success: false,
        message: "Partner is already verified",
      })
    }

    // Update status
    partner.status = "VERIFIED"
    partner.createdBy = req.userId
    await partner.save()

    // Send approval email
    await sendPartnerApprovalEmail(partner.email, partner.companyName)

    res.json({
      success: true,
      message: "Partner approved successfully",
      partner,
    })
  } catch (error) {
    console.error("Approve partner error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to approve partner",
    })
  }
}

// Suspend Partner
exports.suspendPartner = async (req, res) => {
  try {
    const { id } = req.params

    const partner = await Partner.findById(id)
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    if (partner.status === "SUSPENDED") {
      return res.status(400).json({
        success: false,
        message: "Partner is already suspended",
      })
    }

    // Update status
    partner.status = "SUSPENDED"
    await partner.save()

    res.json({
      success: true,
      message: "Partner suspended successfully",
      partner,
    })
  } catch (error) {
    console.error("Suspend partner error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to suspend partner",
    })
  }
}
