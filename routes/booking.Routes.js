const express = require("express")
const { verifyToken } = require("../middleware/auth")
const { requireRole } = require("../middleware/role.middleware")
const bookingController = require("../controllers/bookingController")

const router = express.Router()

// All booking routes require authentication
router.use(verifyToken)

// Booking Management Routes

// Create Booking (User)
router.post("/create",verifyToken, requireRole("customer"), bookingController.createBooking)

// Get All Bookings
// router.get("/bookings", requireRole("platform_admin"), bookingController.getAllBookings)

// Get Booking By User ID
router.get(
  "/myService",
  verifyToken,
  requireRole("customer"),
  bookingController.getUserBookings
)
// Update Booking
// router.put("/bookings/:id", requireRole("platform_admin"), bookingController.updateBooking)

// Cancel Booking
// router.patch("/bookings/:id/cancel", requireRole("user"), bookingController.cancelBooking)

// Partner Confirm Booking
// router.patch("/bookings/:id/confirm", requireRole("partner"), bookingController.confirmBooking)

// Complete Booking
// router.patch("/bookings/:id/complete", requireRole("partner"), bookingController.completeBooking)

module.exports = router