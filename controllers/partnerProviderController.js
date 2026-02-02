const Partner = require("../models/Partner")
const Provider = require("../models/Provider")

// Create Provider
exports.createProvider = async (req, res) => {
  try {
    const { name, email, phone, specialization } = req.body

    // Validation
    if (!name || !email || !phone || !specialization) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    // Create provider
    const provider = new Provider({
      partnerId: req.partnerId,
      name,
      email,
      phone,
      specialization,
      status: "ACTIVE",
    })

    await provider.save()

    // Add provider to partner's providers list
    await Partner.findByIdAndUpdate(req.partnerId, {
      $push: { providers: provider._id },
    })

    res.status(201).json({
      success: true,
      message: "Provider created successfully",
      provider,
    })
  } catch (error) {
    console.error("Create provider error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create provider",
    })
  }
}

// Get All Providers
exports.getProviders = async (req, res) => {
  try {
    const providers = await Provider.find({ partnerId: req.partnerId })

    res.json({
      success: true,
      count: providers.length,
      providers,
    })
  } catch (error) {
    console.error("Get providers error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get providers",
    })
  }
}

// Update Provider
exports.updateProvider = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, phone, specialization, status } = req.body

    // Check if provider belongs to this partner
    const provider = await Provider.findOne({ _id: id, partnerId: req.partnerId })
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found or does not belong to this partner",
      })
    }

    // Update provider
    const updatedProvider = await Provider.findByIdAndUpdate(
      id,
      {
        name: name || provider.name,
        email: email || provider.email,
        phone: phone || provider.phone,
        specialization: specialization || provider.specialization,
        status: status || provider.status,
      },
      { new: true, runValidators: true },
    )

    res.json({
      success: true,
      message: "Provider updated successfully",
      provider: updatedProvider,
    })
  } catch (error) {
    console.error("Update provider error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update provider",
    })
  }
}

// Delete Provider
exports.deleteProvider = async (req, res) => {
  try {
    const { id } = req.params

    // Check if provider belongs to this partner
    const provider = await Provider.findOne({ _id: id, partnerId: req.partnerId })
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found or does not belong to this partner",
      })
    }

    // Delete provider
    await Provider.findByIdAndDelete(id)

    // Remove provider from partner's providers list
    await Partner.findByIdAndUpdate(req.partnerId, {
      $pull: { providers: id },
    })

    res.json({
      success: true,
      message: "Provider deleted successfully",
    })
  } catch (error) {
    console.error("Delete provider error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete provider",
    })
  }
}
