const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/role.middleware");

const partnerServiceController = require("../controllers/partnerServiceController");
const {
  getCustomerServices,
  getServiceById,
  getProvidersByPartnerId,
} = require("../controllers/customerController");

// =====================
// CUSTOMER SERVICES
// =====================

// Get All Services
router.get(
  "/services",
  verifyToken,
    requireRole("customer"),
  getCustomerServices,
);

router.get("/services/:id", verifyToken, requireRole("customer"), getServiceById);

router.get("/getProvider/:partnerId", verifyToken, requireRole("customer"), getProvidersByPartnerId);
// Get Single Service
// router.get(
//   "/services/:id",
//   verifyToken,
//   requireRole("customer"),
//   serviceController.getServiceById
// )

// Search Services
// router.get(
//   "/services/search",
//   verifyToken,
//   requireRole("customer"),
//   serviceController.searchServices
// )

module.exports = router;
