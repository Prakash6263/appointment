const express = require("express")
const router = express.Router()

const partnerAuthController = require("../controllers/partnerAuthController")
const partnerProviderController = require("../controllers/partnerProviderController")
const partnerServiceController = require("../controllers/partnerServiceController")
const partnerBookingController = require("../controllers/partnerBookingController")
const adminPartnerController = require("../controllers/adminPartnerController")

const { verifyPartnerToken } = require("../middleware/partnerAuth.middleware")
const { verifyToken } = require("../middleware/auth")
const { requireRole } = require("../middleware/role.middleware")

// =====================
// PARTNER AUTH ROUTES
// =====================

// Register Partner
router.post("/partner/register", partnerAuthController.registerPartner)

// Verify Email
router.get("/partner/verify-email/:token", partnerAuthController.verifyEmail)

// Login Partner
router.post("/partner/login", partnerAuthController.loginPartner)

// =====================
// PARTNER PROTECTED ROUTES
// =====================

// Get Partner Profile
router.get("/partner/profile", verifyPartnerToken, partnerAuthController.getProfile)

// Update Partner Profile
router.put("/partner/profile", verifyPartnerToken, partnerAuthController.updateProfile)

// =====================
// PROVIDERS CRUD
// =====================

// Create Provider
router.post("/partner/providers", verifyPartnerToken, partnerProviderController.createProvider)

// Get All Providers
router.get("/partner/providers", verifyPartnerToken, partnerProviderController.getProviders)

// Update Provider
router.put("/partner/providers/:id", verifyPartnerToken, partnerProviderController.updateProvider)

// Delete Provider
router.delete("/partner/providers/:id", verifyPartnerToken, partnerProviderController.deleteProvider)

// =====================
// SERVICES CRUD
// =====================

// Create Service
router.post("/partner/services", verifyPartnerToken, partnerServiceController.createService)

// Get All Services
router.get("/partner/services", verifyPartnerToken, partnerServiceController.getServices)

// Update Service
router.put("/partner/services/:id", verifyPartnerToken, partnerServiceController.updateService)

// Delete Service
router.delete("/partner/services/:id", verifyPartnerToken, partnerServiceController.deleteService)

// =====================
// BOOKINGS
// =====================

// Get All Bookings
router.get("/partner/bookings", verifyPartnerToken, partnerBookingController.getBookings)

// Update Booking Status
router.patch("/partner/bookings/:id/status", verifyPartnerToken, partnerBookingController.updateBookingStatus)

// =====================
// ADMIN PARTNER ROUTES
// =====================

// Get All Partners
router.get("/admin/partners", verifyToken, requireRole("PLATFORM_ADMIN"), adminPartnerController.getAllPartners)

// Get Partner Details
router.get("/admin/partners/:id", verifyToken, requireRole("PLATFORM_ADMIN"), adminPartnerController.getPartnerDetails)

// Approve Partner
router.patch("/admin/partners/:id/approve", verifyToken, requireRole("PLATFORM_ADMIN"), adminPartnerController.approvePartner)

// Suspend Partner
router.patch("/admin/partners/:id/suspend", verifyToken, requireRole("PLATFORM_ADMIN"), adminPartnerController.suspendPartner)

module.exports = router
