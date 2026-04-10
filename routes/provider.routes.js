const express = require("express");
const { verifyToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/role.middleware");
const { validateLicense } = require("../middleware/license.middleware");

const providerController = require("../controllers/providerController");
const bookingController = require("../controllers/bookingController");
const partnerProviderController = require("../controllers/partnerProviderController")

const {
  getAvailability,
  updateAvailability,
  setAvailability,
  deleteAvailability,
} = require("../controllers/availabilityController");
const { verifyPartnerToken } = require("../middleware/partnerAuth.middleware");
const upload = require("../middleware/multer");

const router = express.Router();

// ✅ Provider auth middleware
router.use(verifyToken);
router.use(requireRole("provider"));


// =====================
// PROFILE
// =====================
// router.get("/getProfile", providerController.getProfile);
// router.put("/updateProfile", providerController.updateProfile);

// =====================
// AVAILABILITY
// =====================
router.post("/availability/:providerId", verifyToken, setAvailability);
// router.get("/availability", getAvailability);
// router.put("/availability/:id", updateAvailability);
// router.delete("/availability/:id", deleteAvailability);

// =====================
// BOOKINGS
// =====================
router.get("/getAllBookings", providerController.getAllBookings);
router.get("/getTodayBookings", providerController.getTodayBookings);
router.get("/bookingById/:id", bookingController.getBookingById);

router.put(
  "/providers/:providerId",
  verifyToken, // common middleware (partner + provider)
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  partnerProviderController.updateProvider
);


module.exports = router; 
