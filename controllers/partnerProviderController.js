const Partner = require("../models/Partner")
const Provider = require("../models/Provider")
const Plan = require("../models/Plan")
const User = require("../models/User");
const limitService = require("../services/limitService");
const SALT_ROUNDS = 10; // Adjust as needed (10-12 is typical)
const bcrypt = require("bcrypt");


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

    // Get limit info
    const limitInfo = await limitService.getPartnerLimitInfo(partner._id)

    res.json({
      success: true,
      message: "Partner retrieved successfully",
      data: {
        ...partner.toObject(),
        limits: limitInfo.limits,
      },
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
    let {
      name,
      email,
      phone,
      password,
      specialization = "",
      services = [],
    } = req.body;

    // ================= SERVICES PARSE =================
    if (typeof services === "string") {
      try {
        services = JSON.parse(services);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Services must be a valid JSON array",
        });
      }
    }

    // ================= TRIM =================
    name = name?.trim();
    email = email?.toLowerCase().trim();
    phone = phone?.trim();
    specialization = specialization?.trim();

    // ================= VALIDATION =================
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password are required",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Services must be array
    if (!Array.isArray(services)) {
      return res.status(400).json({
        success: false,
        message: "Services must be an array",
      });
    }

    // ================= DUPLICATE CHECK =================
    const existingProvider = await Provider.findOne({
      email,
      partnerId: req.partnerId,
      isDeleted: false,
    });

    if (existingProvider) {
      return res.status(400).json({
        success: false,
        message: "Provider with this email already exists",
      });
    }

    // ================= PROVIDER LIMIT CHECK =================
    const isProviderLimitReached = await limitService.isProviderLimitReached(req.partnerId);
    if (isProviderLimitReached) {
      return res.status(403).json({
        success: false,
        message: "Provider limit reached for this partner",
        limitExceeded: true,
      });
    }

    // ================= FILE UPLOAD =================
    const profileImage = req.files?.profileImage?.[0]?.path || "";

    // ================= HASH PASSWORD =================
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // ================= CREATE PROVIDER =================
    const provider = await Provider.create({
      partnerId: req.partnerId,
      name,
      email,
      phone,
      password: hashedPassword,
      specialization,
      services,
      profileImage,
      status: "ACTIVE",

      // ⭐ IMPORTANT (ensure always present)
      averageRating: 0,
      totalReviews: 0,
    });

    // ================= UPDATE PARTNER =================
    await Partner.findByIdAndUpdate(
      req.partnerId,
      { $push: { providers: provider._id } },
      { new: true }
    );

    // ================= INCREMENT PROVIDER LIMIT =================
    await limitService.incrementUsedProviders(req.partnerId, 1);

    // ================= POPULATE =================
    await provider.populate("services");

    // ================= CLEAN RESPONSE =================
    const providerResponse = provider.toObject();
    delete providerResponse.password;

    return res.status(201).json({
      success: true,
      message: "Provider created successfully",
      provider: providerResponse,
    });

  } catch (error) {
    console.error("Create provider error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create provider",
      error: error.message,
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

//==========get provider by id=============//
exports.getProviderById = async (req, res) => {
  try {
    const { providerId } = req.params;

    // console.log("ID:", providerId);

    const provider = await Provider.findOne({
      _id: providerId,   // ✅ correct
      // partnerId: req.partnerId, (optional)
      // isDeleted: false (optional)
    })
      .populate("services")
      .select("-password");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    return res.status(200).json({
      success: true,
      provider,
    });

  } catch (error) {
    console.error("Get provider error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch provider",
    });
  }
};
// Update Provider

exports.updateProvider = async (req, res) => {
  // console.log("api called")
  try {
    const { providerId } = req.params;

    let {
      name,
      email,
      phone,
      password,
      specialization,
      services,
      experience,
      status,
    } = req.body;

    // ✅ Find provider (ensure belongs to partner)
    const provider = await Provider.findOne({
      _id: providerId,
      partnerId: req.partnerId,
      isDeleted: false,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // ✅ Convert services (form-data fix)
    if (typeof services === "string") {
      try {
        services = JSON.parse(services);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Services must be a valid JSON array",
        });
      }
    }

    // ============================
    // ✅ Update Fields (only if provided)
    // ============================

    if (name) provider.name = name.trim();

    if (email) {
      email = email.toLowerCase().trim();

      // ✅ Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }

      // ✅ Check duplicate email (exclude current provider)
      const existing = await Provider.findOne({
        email,
        _id: { $ne: providerId },
        isDeleted: false,
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }

      provider.email = email;
    }

    if (phone) provider.phone = phone.trim();

    if (specialization !== undefined) {
      provider.specialization = specialization?.trim();
    }

    if (Array.isArray(services)) {
      provider.services = services;
    }

    if (experience !== undefined) {
      provider.experience = Number(experience) || 0;
    }

    if (status && ["ACTIVE", "INACTIVE"].includes(status)) {
      provider.status = status;
    }

    // ✅ Password update (optional)
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      provider.password = hashedPassword;
    }

  // ✅ image fix
if (req.files?.profileImage?.[0]) {
  const file = req.files.profileImage[0];
  provider.profileImage = `/uploads/${file.filename}`;
}

    // ✅ Save updated provider
    await provider.save();

    // ✅ Populate services
    await provider.populate("services");

    // ✅ Remove password from response
    const responseData = provider.toObject();
    delete responseData.password;

    return res.status(200).json({
      success: true,
      message: "Provider updated successfully",
      provider: responseData,
    });

  } catch (error) {
    console.error("Update provider error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update provider",
    });
  }
};

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
