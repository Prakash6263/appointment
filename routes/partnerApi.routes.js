const express = require("express")
const router = express.Router()

const partnerAuthController = require("../controllers/partnerAuthController")
const partnerProviderController = require("../controllers/partnerProviderController")
const partnerServiceController = require("../controllers/partnerServiceController")
const partnerSubServiceController = require("../controllers/PartnerSubServiceController")
const publicCategoryController = require("../controllers/publicCategoryController")
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
router.post("/register",upload.fields([{ name: "logo", maxCount: 1 },
  { name: "profileImage", maxCount: 1 },]),
  partnerAuthController.registerPartner,
)

// Verify Email - Public verification page route (serves HTML)
router.get("/verify/:token", emailVerificationPageController.verifyEmailPage)

// Verify Email - HTML page endpoint (returns HTML instead of JSON)
router.get("/verify-email/:token", emailVerificationPageController.verifyEmailPage)

// Confirm verification from the HTML form
router.post("/confirm-verify", emailVerificationPageController.confirmVerifyEmail)

// Login Partner
router.post("/login", partnerAuthController.loginPartner)

// Forget Password - Send OTP to Email (Public)
router.post("/partner/forget-password", partnerAuthController.forgetPassword)

// Verify Password Reset OTP (Public)
router.post("/verify-reset-otp", partnerAuthController.verifyPasswordResetOTP)

// Reset Password - Update Password with OTP (Public)
router.post("/reset-password", partnerAuthController.resetPassword)


// ===================== PARTNER PROTECTED ROUTES =====================//

// Get Partner Profile
router.get("/profile", verifyPartnerToken, partnerAuthController.getProfile)

// Update Partner Profile with optional file uploads
router.put("/profile",verifyPartnerToken,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
  ]),
  partnerAuthController.updateProfile,
)


// ===================== PROVIDERS CRUD =====================//

// Create Provider
router.post("/providers",verifyPartnerToken,upload.fields([{ name: "profileImage", maxCount: 1 }]),partnerProviderController.createProvider);

// Get All Providers
router.get("/providers", verifyPartnerToken, partnerProviderController.getProviders)

// Get Providers By Id
router.get("/providers/:providerId", verifyPartnerToken, partnerProviderController.getProviderById)

// Update Provider
router.put("/providersUpdate/:providerId",verifyPartnerToken,upload.fields([{ name: "profileImage", maxCount: 1 }]),partnerProviderController.updateProvider);

// Delete Provider
router.delete("/providers/:id", verifyPartnerToken, partnerProviderController.deleteProvider)


// ===================== CATEGORIES (read-only for partners) =====================//

// Get All Active Categories (public — partners browse to select when creating services)
router.get("/categories", publicCategoryController.getActiveCategories)


// ===================== SERVICES CRUD =====================//

// Create Service
router.post("/services", verifyPartnerToken, upload.single("image"), partnerServiceController.createService)
// Get All Services (supports ?categoryId=&isActive= filters)
router.get("/services", verifyPartnerToken, partnerServiceController.getServices)
// Get Service By Id
router.get("/services/:id", verifyPartnerToken, partnerServiceController.getServiceById)
// Update Service
router.put("/services/:id", verifyPartnerToken, upload.single("image"), partnerServiceController.updateService)
// Soft Delete Service
router.delete("/services/:id", verifyPartnerToken, partnerServiceController.deleteService)
// Set Service Availability
router.patch("/availability", verifyPartnerToken, partnerServiceController.setAvailability);


// ===================== SUB SERVICES CRUD =====================//

// Create SubService
router.post(
  "/sub-services",
  verifyPartnerToken,
  upload.single("image"),
  partnerSubServiceController.createSubService
);

// Get All SubServices (supports ?serviceId=&gender= filters)
router.get(
  "/sub-services",
  verifyToken,
  partnerSubServiceController.getSubServices
);

// Get SubService By Id
router.get(
  "/sub-services/:id",
  verifyPartnerToken,
  partnerSubServiceController.getSubServiceById
);


// Update SubService
router.put(
  "/sub-services/:id",
  verifyPartnerToken,
  upload.single("image"),
  partnerSubServiceController.updateSubService
);

// Soft Delete SubService
router.delete(
  "/sub-services/:id",
  verifyPartnerToken,
  partnerSubServiceController.deleteSubService
);

// ===================== BOOKINGS=======================//

// Get All Bookings
router.get("/bookings", verifyPartnerToken, partnerBookingController.getBookings)

// Update Booking Status
router.patch("/bookings/:id/status", verifyPartnerToken, partnerBookingController.updateBookingStatus)


// =====================ADMIN PARTNER ROUTES========================//
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
