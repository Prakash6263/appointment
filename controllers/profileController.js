const User = require("../models/User")

// Get user/provider profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId

    // Find user by ID
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      message: "Profile retrieved successfully",
      data: {
        user: user.toJSON(),
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve profile",
    })
  }
}

// Get user by ID (admin or profile view)
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params

    // Find user by ID
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      message: "User data retrieved successfully",
      data: {
        user: user.toJSON(),
      },
    })
  } catch (error) {
    console.error("Get user by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user data",
    })
  }
}

// Get providers list
exports.getProviders = async (req, res) => {
  try {
    // Find all providers
    const providers = await User.find({ role: "provider", isActive: true }).select("-password -otp -resetPasswordOtp")

    res.json({
      success: true,
      message: "Providers retrieved successfully",
      data: {
        count: providers.length,
        providers: providers.map((provider) => provider.toJSON()),
      },
    })
  } catch (error) {
    console.error("Get providers error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve providers",
    })
  }
}

// Get customers list (admin only)
exports.getCustomers = async (req, res) => {
  try {
    // Find all customers
    const customers = await User.find({ role: "customer", isActive: true }).select("-password -otp -resetPasswordOtp")

    res.json({
      success: true,
      message: "Customers retrieved successfully",
      data: {
        count: customers.length,
        customers: customers.map((customer) => customer.toJSON()),
      },
    })
  } catch (error) {
    console.error("Get customers error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve customers",
    })
  }
}
