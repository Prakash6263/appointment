const User = require("../models/User")
const Partner = require("../models/Partner")

// Create Provider
exports.createProvider = async (req, res) => {
  try {
    const { userId } = req
    const { email, password, username, phoneNumber } = req.body

    // Validate fields
    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and username are required",
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or username already registered",
      })
    }

    // Find partner to check provider limit
    const partner = await Partner.findOne({ ownerUserId: userId })
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    // Check provider limit
    if (partner.license.usedProviders >= partner.license.providerLimit) {
      return res.status(400).json({
        success: false,
        message: "Provider limit reached for your plan",
      })
    }

    // Create provider user
    const provider = new User({
      email,
      password,
      username,
      phoneNumber,
      role: "provider",
      isEmailVerified: true,
    })

    await provider.save()

    // Update partner provider count
    partner.license.usedProviders += 1
    await partner.save()

    res.status(201).json({
      success: true,
      message: "Provider created successfully",
      data: {
        providerId: provider._id,
        email: provider.email,
        username: provider.username,
      },
    })
  } catch (error) {
    console.error("Create provider error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create provider",
    })
  }
}

// List Providers
exports.listProviders = async (req, res) => {
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

    // Note: In a production system, you would have a separate way to track
    // which providers belong to which partner. This is a simplified example.
    const providers = await User.find({ role: "provider", isActive: true })

    res.json({
      success: true,
      message: "Providers retrieved successfully",
      data: providers,
    })
  } catch (error) {
    console.error("List providers error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to list providers",
    })
  }
}

// Deactivate Provider
exports.deactivateProvider = async (req, res) => {
  try {
    const { userId } = req
    const { providerId } = req.params

    // Find provider
    const provider = await User.findById(providerId)
    if (!provider || provider.role !== "provider") {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      })
    }

    // Deactivate provider
    provider.isActive = false
    await provider.save()

    // Update partner provider count
    const partner = await Partner.findOne({ ownerUserId: userId })
    if (partner && partner.license.usedProviders > 0) {
      partner.license.usedProviders -= 1
      await partner.save()
    }

    res.json({
      success: true,
      message: "Provider deactivated successfully",
      data: {
        providerId: provider._id,
      },
    })
  } catch (error) {
    console.error("Deactivate provider error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to deactivate provider",
    })
  }
}
