const Transaction = require("../models/Transaction")
const Plan = require("../models/Plan")
const Partner = require("../models/Partner")

// Helper: Calculate plan expiration date
const calculateExpirationDate = (billingCycle) => {
  const now = new Date()
  if (billingCycle === "monthly") {
    return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
  } else if (billingCycle === "yearly") {
    return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
  }
  return now
}

// Helper: Generate transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `TXN-${timestamp}-${random}`
}

// Get All Plans (Public endpoint)
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 })

    if (!plans || plans.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No plans available",
        data: [],
      })
    }

    res.status(200).json({
      success: true,
      message: "Plans retrieved successfully",
      data: plans,
    })
  } catch (error) {
    console.error("[v0] Get all plans error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve plans",
      error: error.message,
    })
  }
}

// Create Purchase Transaction (Pending)
exports.createPurchaseTransaction = async (req, res) => {
  try {
    const { planId } = req.body
    const partnerId = req.partnerId

    // Validate input
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      })
    }

    // Check if plan exists
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
        message: "Plan is not available for purchase",
      })
    }

    // Get partner details
    const partner = await Partner.findById(partnerId)
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    // Calculate plan expiration
    const expiresAt = calculateExpirationDate(plan.billingCycle)

    // Create transaction
    const transaction = new Transaction({
      transactionId: generateTransactionId(),
      partnerId,
      planId,
      amount: plan.price,
      currency: "USD",
      status: "PENDING",
      billingCycle: plan.billingCycle,
      planDetails: {
        planName: plan.name,
        customerLimit: plan.customerLimit,
        providerLimit: plan.providerLimit,
      },
      planExpiresAt: expiresAt,
      companyName: partner.companyName,
      ownerName: partner.ownerName,
      email: partner.email,
      phone: partner.phone,
    })

    await transaction.save()

    console.log("[v0] Transaction created:", transaction.transactionId)

    res.status(201).json({
      success: true,
      message: "Purchase initiated. Awaiting payment confirmation.",
      data: {
        transactionId: transaction.transactionId,
        partnerId: transaction.partnerId,
        planId: transaction.planId,
        amount: transaction.amount,
        status: transaction.status,
        planDetails: transaction.planDetails,
        createdAt: transaction.createdAt,
      },
    })
  } catch (error) {
    console.error("[v0] Create purchase transaction error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create purchase transaction",
      error: error.message,
    })
  }
}

// Confirm Payment and Activate Plan
exports.confirmPayment = async (req, res) => {
  try {
    const { transactionId, paymentMethod } = req.body
    const partnerId = req.partnerId

    // Validate input
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      })
    }

    // Find transaction
    const transaction = await Transaction.findOne({ transactionId })
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      })
    }

    // Verify ownership
    if (transaction.partnerId.toString() !== partnerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only confirm your own transactions",
      })
    }

    // Check if already confirmed
    if (transaction.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Transaction is already ${transaction.status}`,
      })
    }

    // Update transaction status
    transaction.status = "COMPLETED"
    transaction.paymentMethod = paymentMethod || "MANUAL"
    transaction.paymentConfirmedAt = new Date()
    transaction.paymentConfirmedBy = partnerId

    await transaction.save()

    // Activate plan on partner account
    const partner = await Partner.findById(partnerId)
    if (!partner) {
      // Rollback transaction
      transaction.status = "FAILED"
      transaction.failureReason = "Partner not found during activation"
      await transaction.save()

      return res.status(404).json({
        success: false,
        message: "Partner account not found",
      })
    }

    // Update partner license
    partner.license.planId = transaction.planId
    partner.license.planType = transaction.amount > 0 ? "PAID" : "FREE"
    partner.license.customerLimit = transaction.planDetails.customerLimit
    partner.license.providerLimit = transaction.planDetails.providerLimit
    partner.license.usedCustomers = 0
    partner.license.usedProviders = 0
    partner.license.isActive = true
    partner.license.expiresAt = transaction.planExpiresAt

    await partner.save()

    // Update transaction activation details
    transaction.activatedAt = new Date()

    await transaction.save()

    console.log(
      "[v0] Payment confirmed and plan activated for partner:",
      partnerId,
    )

    res.status(200).json({
      success: true,
      message: "Payment confirmed successfully. Plan activated!",
      data: {
        transactionId: transaction.transactionId,
        status: transaction.status,
        paymentConfirmedAt: transaction.paymentConfirmedAt,
        activatedAt: transaction.activatedAt,
        planExpiresAt: transaction.planExpiresAt,
        license: partner.license,
      },
    })
  } catch (error) {
    console.error("[v0] Confirm payment error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to confirm payment",
      error: error.message,
    })
  }
}

// Get Transaction History
exports.getTransactionHistory = async (req, res) => {
  try {
    const partnerId = req.partnerId
    const { page = 1, limit = 10, status } = req.query

    // Build query
    const query = { partnerId }
    if (status) {
      query.status = status
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    const totalTransactions = await Transaction.countDocuments(query)
    const totalPages = Math.ceil(totalTransactions / limit)

    // Fetch transactions
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("planId", "name price customerLimit providerLimit billingCycle")

    console.log(
      "[v0] Retrieved transaction history for partner:",
      partnerId,
      "Count:",
      transactions.length,
    )

    res.status(200).json({
      success: true,
      message: "Transaction history retrieved successfully",
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalTransactions,
        totalPages,
      },
    })
  } catch (error) {
    console.error("[v0] Get transaction history error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve transaction history",
      error: error.message,
    })
  }
}

// Get Transaction Details
exports.getTransactionDetails = async (req, res) => {
  try {
    const { transactionId } = req.params
    const partnerId = req.partnerId

    // Find transaction
    const transaction = await Transaction.findOne({ transactionId }).populate(
      "planId",
      "name price customerLimit providerLimit billingCycle description",
    )

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      })
    }

    // Verify ownership
    if (transaction.partnerId.toString() !== partnerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only view your own transactions",
      })
    }

    console.log("[v0] Retrieved transaction details:", transactionId)

    res.status(200).json({
      success: true,
      message: "Transaction details retrieved successfully",
      data: transaction,
    })
  } catch (error) {
    console.error("[v0] Get transaction details error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve transaction details",
      error: error.message,
    })
  }
}

// Cancel Transaction (before payment)
exports.cancelTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params
    const partnerId = req.partnerId
    const { reason } = req.body

    // Find transaction
    const transaction = await Transaction.findOne({ transactionId })
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      })
    }

    // Verify ownership
    if (transaction.partnerId.toString() !== partnerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only cancel your own transactions",
      })
    }

    // Check if transaction can be cancelled
    if (transaction.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${transaction.status} transaction`,
      })
    }

    // Update transaction
    transaction.status = "CANCELLED"
    transaction.failureReason = reason || "Cancelled by partner"

    await transaction.save()

    console.log("[v0] Transaction cancelled:", transactionId)

    res.status(200).json({
      success: true,
      message: "Transaction cancelled successfully",
      data: {
        transactionId: transaction.transactionId,
        status: transaction.status,
      },
    })
  } catch (error) {
    console.error("[v0] Cancel transaction error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to cancel transaction",
      error: error.message,
    })
  }
}
