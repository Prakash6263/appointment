const Partner = require("../models/Partner")
const Provider = require("../models/Provider")
const Plan = require("../models/Plan")
const User = require("../models/User");
const bcrypt = require("bcryptjs/dist/bcrypt");
// const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10; // Adjust as needed (10-12 is typical)

// Create Partner
exports.createPartner = async (req, res) => {
  try {
    const { businessName } = req.body
    const { userId } = req

    if (!businessName) {
      return res.status(400).json({
        success: false,
        message: "Business name is required",
      })
    }

    // Check if user already has a partner
    const existingPartner = await Partner.findOne({ ownerUserId: userId })
    if (existingPartner) {
      return res.status(400).json({
        success: false,
        message: "You already have a partner account",
      })
    }

    // Get free plan
    const freePlan = await Plan.findOne({ name: "Free", isActive: true })
    if (!freePlan) {
      return res.status(500).json({
        success: false,
        message: "Free plan not available",
      })
    }

    // Create partner
    const partner = new Partner({
      businessName,
      ownerUserId: userId,
      license: {
        planId: freePlan._id,
        planType: "FREE",
        customerLimit: freePlan.customerLimit,
        providerLimit: freePlan.providerLimit,
        isActive: true,
      },
    })

    await partner.save()

    // Update user role to partner_admin
    await User.findByIdAndUpdate(userId, { role: "partner_admin" })

    res.status(201).json({
      success: true,
      message: "Partner created successfully with Free plan",
      data: partner,
    })
  } catch (error) {
    console.error("Create partner error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create partner",
    })
  }
}

// Get Partner
exports.getPartner = async (req, res) => {
  try {
    const { userId } = req

    const partner = await Partner.findOne({ ownerUserId: userId }).populate("license.planId")
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    res.json({
      success: true,
      message: "Partner retrieved successfully",
      data: partner,
    })
  } catch (error) {
    console.error("Get partner error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get partner",
    })
  }
}

// Update Partner with Location Fields
exports.updatePartner = async (req, res) => {
  try {
    const { userId } = req
    const { businessName, country, state, city, gstNumber, websiteName } = req.body

    const partner = await Partner.findOne({ ownerUserId: userId })
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    if (businessName) partner.businessName = businessName
    if (country) partner.country = country
    if (state) partner.state = state
    if (city) partner.city = city
    if (gstNumber) partner.gstNumber = gstNumber
    if (websiteName) partner.websiteName = websiteName

    await partner.save()

    res.json({
      success: true,
      message: "Partner updated successfully",
      data: partner,
    })
  } catch (error) {
    console.error("Update partner error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update partner",
    })
  }
}

// Create Provider

exports.createProvider = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,               // ✅ Added password to destructuring
      specialization,
      services = [],
    } = req.body;

    // ✅ Basic Validation (now includes password)
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password are required",
      });
    }

    // ✅ Email format validation (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // ✅ Check duplicate email (per partner)
    const existingProvider = await Provider.findOne({
      email: email.toLowerCase(),
      partnerId: req.partnerId,
      isDeleted: false,
    });

    if (existingProvider) {
      return res.status(400).json({
        success: false,
        message: "Provider with this email already exists",
      });
    }

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // ✅ Create provider with hashed password
    const provider = new Provider({
      partnerId: req.partnerId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,     // ✅ Store hashed password
      specialization: specialization.trim(),
      services,
      status: "ACTIVE",
    });

    await provider.save();

    // ✅ Add provider to partner
    await Partner.findByIdAndUpdate(req.partnerId, {
      $push: { providers: provider._id },
    });

    // ✅ Populate services (optional for response)
    await provider.populate("services");

    // ⚠️ Avoid sending the password back in the response
    const providerResponse = provider.toObject();
    delete providerResponse.password;

    res.status(201).json({
      success: true,
      message: "Provider created successfully",
      provider: providerResponse,
    });
  } catch (error) {
    console.error("Create provider error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create provider",
    });
  }
};

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
