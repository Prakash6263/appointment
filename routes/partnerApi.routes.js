const express = require("express")
const router = express.Router()

const partnerAuthController = require("../controllers/partnerAuthController")
const partnerProviderController = require("../controllers/partnerProviderController")
const partnerServiceController = require("../controllers/partnerServiceController")
const partnerBookingController = require("../controllers/partnerBookingController")
const adminPartnerController = require("../controllers/adminPartnerController")
const emailVerificationPageController = require("../controllers/emailVerificationPageController")
const upload = require("../middleware/multer")

const { verifyPartnerToken } = require("../middleware/partnerAuth.middleware")
const { verifyToken } = require("../middleware/auth")
const { requireRole } = require("../middleware/role.middleware")

// =====================
// PARTNER AUTH ROUTES
// =====================

// Register Partner with optional file uploads
router.post(
  "/partner/register",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
  ]),
  partnerAuthController.registerPartner,
)

// Verify Email - Public verification page route (serves HTML)
router.get("/partner/verify/:token", emailVerificationPageController.verifyEmailPage)

// Verify Email - HTML page endpoint (returns HTML instead of JSON)
router.get("/partner/verify-email/:token", emailVerificationPageController.verifyEmailPage)

// Confirm verification from the HTML form
router.post("/partner/confirm-verify", emailVerificationPageController.confirmVerifyEmail)

// Login Partner
router.post("/partner/login", partnerAuthController.loginPartner)

// =====================
// PARTNER PROTECTED ROUTES
// =====================

// Get Partner Profile
router.get("/partner/profile", verifyPartnerToken, partnerAuthController.getProfile)

// Update Partner Profile with optional file uploads
router.put(
  "/partner/profile",
  verifyPartnerToken,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
  ]),
  partnerAuthController.updateProfile,
)

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
router.get("/admin/partners", verifyToken, requireRole("platform_admin"), adminPartnerController.getAllPartners)

// Get Partner Details
router.get("/admin/partners/:id", verifyToken, requireRole("platform_admin"), adminPartnerController.getPartnerDetails)

// Approve Partner
router.patch("/admin/partners/:id/approve", verifyToken, requireRole("platform_admin"), adminPartnerController.approvePartner)

// Suspend Partner
router.patch("/admin/partners/:id/suspend", verifyToken, requireRole("platform_admin"), adminPartnerController.suspendPartner)

// Disable Partner
router.patch("/admin/partners/:id/disable", verifyToken, requireRole("platform_admin"), adminPartnerController.disablePartner)

// Enable Partner
router.patch("/admin/partners/:id/enable", verifyToken, requireRole("platform_admin"), adminPartnerController.enablePartner)

// Create Partner (Platform Admin)
router.post("/admin/partners", verifyToken, requireRole("platform_admin"), adminPartnerController.createPartner)

// Delete Partner (Platform Admin)
router.delete("/admin/partners/:id", verifyToken, requireRole("platform_admin"), adminPartnerController.deletePartner)

module.exports = router
