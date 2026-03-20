const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/role.middleware");
// 👉 import controller
const bookingController = require("../controllers/bookingController");

const partnerServiceController = require("../controllers/partnerServiceController");
const {
  getCustomerServices,
  getServiceById,
  getProvidersByPartnerId,
} = require("../controllers/customerController");
const { changePassword } = require("../controllers/authController");

// const { getAllPartners } = require("../controllers/adminPartnerController");


// =====================CUSTOMER SERVICES ===================== //


// Get All Services
router.get("/services",verifyToken,requireRole("customer"),getCustomerServices,);
// Get  Services By Id
router.get("/services/:id", verifyToken, requireRole("customer"), getServiceById);
// Get Provider
router.get("/getProvider/:partnerId", verifyToken, requireRole("customer"), getProvidersByPartnerId);

// Create Booking
router.post("/createBooking",verifyToken, requireRole("customer"), bookingController.createBooking);
// Get customer Bookings
router.get("/userBookings",verifyToken, requireRole("customer"),bookingController.getUserBookings);

// Change Password
router.put("/change-password", verifyToken, requireRole("customer"), changePassword);

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
