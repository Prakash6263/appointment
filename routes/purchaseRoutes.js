const express = require("express")
const router = express.Router()
const transactionController = require("../controllers/transactionController")
const { verifyPartnerToken } = require("../middleware/partnerAuth.middleware")

// =====================
// PLAN PURCHASE ROUTES
// =====================

// 1. Get all available plans (Public - no auth required)
router.get("/plans", transactionController.getAllPlans)

// 2. Create purchase transaction - Initiate purchase (Protected)
router.post(
  "/purchase",
  verifyPartnerToken,
  transactionController.createPurchaseTransaction,
)

// 3. Confirm payment and activate plan (Protected)
router.post(
  "/confirm-payment",
  verifyPartnerToken,
  transactionController.confirmPayment,
)

// 4. Get transaction history (Protected)
router.get(
  "/transactions",
  verifyPartnerToken,
  transactionController.getTransactionHistory,
)

// 5. Get transaction details (Protected)
router.get(
  "/transactions/:transactionId",
  verifyPartnerToken,
  transactionController.getTransactionDetails,
)

// 6. Cancel transaction (Protected)
router.delete(
  "/transactions/:transactionId",
  verifyPartnerToken,
  transactionController.cancelTransaction,
)

module.exports = router
