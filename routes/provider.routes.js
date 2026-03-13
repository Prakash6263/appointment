const express = require("express")
const { verifyToken } = require("../middleware/auth")
const { requireRole } = require("../middleware/role.middleware")
const { ensurePartnerAccess } = require("../middleware/partnerAccess.middleware")
const { validateLicense } = require("../middleware/license.middleware")
const providerController = require("../controllers/providerController")

const router = express.Router()

// All provider routes require partner_admin role and license validation
router.use(verifyToken)
router.use(requireRole("partner_admin"))
router.use(ensurePartnerAccess)
router.use(validateLicense)

// Provider Management Routes
router.post("/providers", providerController.createProvider)
router.get("/providers", providerController.listProviders)
// router.get("/providers/:providerId", providerController.getProvider)
// router.put("/providers/:providerId", providerController.updateProvider)
router.delete("/providers/:providerId", providerController.deactivateProvider)

// Services Management Routes
router.post("/services", serviceController.createService)
router.get("/services", serviceController.listServices)
router.get("/services/:serviceId", serviceController.getService)
router.put("/services/:serviceId", serviceController.updateService)
router.delete("/services/:serviceId", serviceController.deactivateService)

// Provider Availability Routes
router.post("/availability", availabilityController.setAvailability)
router.get("/availability", availabilityController.getAvailability)
router.put("/availability/:id", availabilityController.updateAvailability)
router.delete("/availability/:id", availabilityController.deleteAvailability)

// Booking Management 
router.get("/bookings", bookingController.listBookings)
router.get("/bookings/:id", bookingController.getBooking)
router.put("/bookings/:id/status", bookingController.updateBookingStatus)
module.exports = router
