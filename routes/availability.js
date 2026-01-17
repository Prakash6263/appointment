const express = require("express")
const { verifyToken } = require("../middleware/auth")
const availabilityController = require("../controllers/availabilityController")

const router = express.Router()

// All routes require authentication
router.use(verifyToken)

// Get provider availability
router.get("/:providerId", availabilityController.getAvailability)

// Update entire availability
router.put("/:providerId", availabilityController.updateAvailability)

// Toggle online status
router.patch("/:providerId/toggle-online", availabilityController.toggleOnlineStatus)

// Update single day schedule
router.patch("/:providerId/day/:day", availabilityController.updateDaySchedule)

module.exports = router
