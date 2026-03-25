const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/role.middleware");

// 👉 import controllers
const bookingController = require("../controllers/bookingController");
const {
  getCustomerServices,
  getServiceById,
  getProvidersByPartnerId,
  getProviderDetails,
  getProviderReviews,
  addProviderReview,
  createContact,
} = require("../controllers/customerController");
const { changePassword, getProfile, editProfile } = require("../controllers/authController");
const { createReview, getServiceReviews, updateReview, deleteReview } = require("../controllers/reviewController");

// =====================CUSTOMER ACCOUNT ===================== //

// Get customer profile
// router.get("/profile", verifyToken, requireRole("customer"), getProfile);

// Edit customer profile (with optional profile image)
router.put("/edit-profile", verifyToken, requireRole("customer"), editProfile);

// Change password
// router.put("/change-password", verifyToken, requireRole("customer"), changePassword);

// =====================SERVICES ===================== //

// Get all services
router.get("/services", verifyToken, requireRole("customer"), getCustomerServices);

// Get service by ID
router.get("/services/:id", verifyToken, requireRole("customer"), getServiceById);

// Get providers for a specific partner
router.get("/getProvider/:partnerId", verifyToken, requireRole("customer"), getProvidersByPartnerId);

// Get provider details
// router.get("/providers/:id", verifyToken, requireRole("customer"), getProviderDetails);

// Get reviews of a provider
// router.get("/providers/:id/reviews", verifyToken, requireRole("customer"), getProviderReviews);

// Add a review for a provider
// router.post("/providers/:id/review", verifyToken, requireRole("customer"), addProviderReview);

// =====================BOOKINGS ===================== //

// Create a new booking
router.post("/createBooking", verifyToken, requireRole("customer"), bookingController.createBooking);

// Get all bookings for the logged-in customer
router.get("/userBookings", verifyToken, requireRole("customer"), bookingController.getUserBookings);

// Get details of a specific booking
router.get("/userBookingDetails/:id", verifyToken, requireRole("customer"), bookingController.getUserBookingById);

// Get my compleated booking with userId+serviceId
router.get("/compleatedBooking", verifyToken, requireRole("customer"), bookingController.getCompleatedBooking);

// Cancel a booking
router.put("/cancelBooking/:id", verifyToken, requireRole("customer"), bookingController.cancelBooking);

// Reschedule a booking
// router.put("/rescheduleBooking/:id", verifyToken, requireRole("customer"), bookingController.rescheduleBooking);



// =====================REVIEW ===================== //
// create
router.post("/createReview",verifyToken, requireRole("customer"), createReview);

// get reviews by service
router.get("/getReview/:serviceId", getServiceReviews);

// update
router.put("/update/:id", verifyToken, requireRole("customer"), updateReview);

// delete
router.delete("/delete/:id", verifyToken, requireRole("customer"), deleteReview);


// =====================PAYMENTS / INVOICES (Optional) ===================== //

// Get payment/invoice details for a booking
// router.get("/booking/:id/payment", verifyToken, requireRole("customer"), bookingController.getBookingPayment);

// =====================FAVORITES (Optional) ===================== //

// Add service or provider to favorites
// router.post("/favorites", verifyToken, requireRole("customer"), bookingController.addFavorite);

// Get all favorites of customer
// router.get("/favorites", verifyToken, requireRole("customer"), bookingController.getFavorites);

// Remove favorite by ID
// router.delete("/favorites/:id", verifyToken, requireRole("customer"), bookingController.removeFavorite);

// =====================NOTIFICATIONS (Optional) ===================== //

// Get customer notifications
// router.get("/notifications", verifyToken, requireRole("customer"), bookingController.getNotifications);

// Mark a notification as read
// router.put("/notifications/:id/read", verifyToken, requireRole("customer"), bookingController.markNotificationRead);

// Create a new booking
router.post("/createContact", verifyToken, requireRole("customer"), createContact);

module.exports = router;