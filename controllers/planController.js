const Plan = require("../models/Plan")

// Create Plan
exports.createPlan = async (req, res) => {
  try {
    const { name, price, billingCycle, customerLimit, providerLimit, features } = req.body

    // Validate required fields
    if (!name || !billingCycle || customerLimit === undefined || providerLimit === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      })
    }

    // Check if plan already exists
    const existingPlan = await Plan.findOne({ name })
    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: "Plan already exists",
      })
    }

    // Create new plan
    const plan = new Plan({
      name,
      price: price || 0,
      billingCycle,
      customerLimit,
      providerLimit,
      features: features || {},
    })

    await plan.save()

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      data: plan,
    })
  } catch (error) {
    console.error("Create plan error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create plan",
    })
  }
}

// Update Plan
exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params
    const { name, price, billingCycle, customerLimit, providerLimit, features, isActive } = req.body

    // Find plan
    const plan = await Plan.findById(id)
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      })
    }

    // Update fields
    if (name) plan.name = name
    if (price !== undefined) plan.price = price
    if (billingCycle) plan.billingCycle = billingCycle
    if (customerLimit !== undefined) plan.customerLimit = customerLimit
    if (providerLimit !== undefined) plan.providerLimit = providerLimit
    if (features) plan.features = { ...plan.features, ...features }
    if (isActive !== undefined) plan.isActive = isActive

    await plan.save()

    res.json({
      success: true,
      message: "Plan updated successfully",
      data: plan,
    })
  } catch (error) {
    console.error("Update plan error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update plan",
    })
  }
}

// List Plans
exports.listPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ createdAt: -1 })

    res.json({
      success: true,
      message: "Plans retrieved successfully",
      data: plans,
    })
  } catch (error) {
    console.error("List plans error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to list plans",
    })
  }
}

// Get Plan by ID
exports.getPlanById = async (req, res) => {
  try {
    const { id } = req.params

    const plan = await Plan.findById(id)
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      })
    }

    res.json({
      success: true,
      message: "Plan retrieved successfully",
      data: plan,
    })
  } catch (error) {
    console.error("Get plan error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get plan",
    })
  }
}
