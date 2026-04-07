const Partner = require("../models/Partner")
const { sendPartnerApprovalEmail } = require("../utils/partnerEmailUtils")

// Get All Partners with Filters
exports.getAllPartners = async (req, res) => {
  try {
    const { status, isPending, isVerified, isSuspended, country, city, page = 1, limit = 10, search } = req.query

    let query = {}

    // Filter by status
    if (status) {
      query.status = status
    }

    // Filter by isPending
    if (isPending === "true") {
      query.status = "PENDING"
    }

    // Filter by isVerified
    if (isVerified === "true") {
      query.status = "VERIFIED"
    }

    // Filter by isSuspended
    if (isSuspended === "true") {
      query.status = "SUSPENDED"
    }

    // Filter by country
    if (country) {
      query.country = new RegExp(country, "i")
    }

    // Filter by city
    if (city) {
      query.city = new RegExp(city, "i")
    }

    // Search by company name, owner name, or email
    if (search) {
      query.$or = [
        { companyName: new RegExp(search, "i") },
        { ownerName: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ]
    }

    // Pagination
    const skip = (page - 1) * limit
    const total = await Partner.countDocuments(query)

    const partners = await Partner.find(query)
      .populate("providers")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))

    const Service = require("../models/Service")
    const partnerIds = partners.map((p) => p._id)
    const allServices = await Service.find({ partnerId: { $in: partnerIds }, isDeleted: false })
    const servicesByPartner = allServices.reduce((acc, s) => {
      const key = String(s.partnerId)
      if (!acc[key]) acc[key] = []
      acc[key].push(s)
      return acc
    }, {})

    const partnersWithServices = partners.map((p) => ({
      ...p.toObject(),
      services: servicesByPartner[String(p._id)] || [],
    }))

    res.json({
      success: true,
      count: partnersWithServices.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      partners: partnersWithServices,
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

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    const Service = require("../models/Service")
    const services = await Service.find({ partnerId: id, isDeleted: false })

    res.json({
      success: true,
      partner: { ...partner.toObject(), services },
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

    // Send approval email with owner name
    await sendPartnerApprovalEmail(partner.email, partner.companyName, partner.ownerName)

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

// Disable Partner (Toggle isActive)
exports.disablePartner = async (req, res) => {
  try {
    const { id } = req.params

    const partner = await Partner.findById(id)
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    partner.isActive = false
    await partner.save()

    res.json({
      success: true,
      message: "Partner disabled successfully",
      partner,
    })
  } catch (error) {
    console.error("Disable partner error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to disable partner",
    })
  }
}

// Enable Partner (Toggle isActive)
exports.enablePartner = async (req, res) => {
  try {
    const { id } = req.params

    const partner = await Partner.findById(id)
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    partner.isActive = true
    await partner.save()

    res.json({
      success: true,
      message: "Partner enabled successfully",
      partner,
    })
  } catch (error) {
    console.error("Enable partner error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to enable partner",
    })
  }
}

// Create Partner (Platform Admin)
exports.createPartner = async (req, res) => {
  try {
    const bcrypt = require("bcryptjs")
    const { companyName, ownerName, email, phone, password, country, state, city, gstNumber, websiteName } = req.body

    // Validation
    if (!companyName || !ownerName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create partner
    const partner = new Partner({
      companyName,
      ownerName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      country: country || null,
      state: state || null,
      city: city || null,
      gstNumber: gstNumber || null,
      websiteName: websiteName || null,
      status: "VERIFIED",
      isEmailVerified: true,
      createdBy: req.userId,
      isActive: true,
    })

    await partner.save()

    res.status(201).json({
      success: true,
      message: "Partner created successfully by platform admin",
      partner: {
        _id: partner._id,
        companyName: partner.companyName,
        email: partner.email,
        phone: partner.phone,
        country: partner.country,
        state: partner.state,
        city: partner.city,
        status: partner.status,
        isActive: partner.isActive,
      },
    })
  } catch (error) {
    console.error("Create partner error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create partner",
    })
  }
}

// Delete Partner (Platform Admin)
exports.deletePartner = async (req, res) => {
  try {
    const { id } = req.params

    const partner = await Partner.findById(id)
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    // Delete associated providers and services
    if (partner.providers && partner.providers.length > 0) {
      await require("../models/Provider").deleteMany({ _id: { $in: partner.providers } })
    }

    await require("../models/Service").deleteMany({ partnerId: id })

    // Delete partner
    await Partner.findByIdAndDelete(id)

    res.json({
      success: true,
      message: "Partner deleted successfully along with all associated data",
    })
  } catch (error) {
    console.error("Delete partner error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete partner",
    })
  }
}
