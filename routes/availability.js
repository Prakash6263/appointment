const express = require("express")
const { verifyToken } = require("../middleware/auth")
const availabilityController = require("../controllers/availabilityController")
const blockTimeController = require("../controllers/blockTimeController")

const router = express.Router()

// All routes require authentication
router.use(verifyToken)

// ===================== PROVIDER AVAILABILITY ROUTES =====================
// Set provider availability
router.post("/:providerId", availabilityController.setAvailability)

// Get provider availability
router.get("/:providerId", availabilityController.getAvailability)

// Update entire availability
router.put("/:providerId", availabilityController.updateAvailability)

// Toggle online status
router.patch("/:providerId/toggle-online", availabilityController.toggleOnlineStatus)

// Update single day schedule
router.patch("/:providerId/day/:day", availabilityController.updateDaySchedule)

// ===================== BLOCK TIME ROUTES =====================
// Create block time (break/blocked period)
router.post("/:providerId/block-time", blockTimeController.createBlockTime)

// Get all block times for provider (with optional date range)
router.get("/:providerId/block-times", blockTimeController.getBlockTimes)

// Get block times for specific date
router.get("/:providerId/block-times/date", blockTimeController.getBlockTimesByDate)

// Update block time
router.put("/:providerId/block-time/:blockTimeId", blockTimeController.updateBlockTime)

// Delete block time
router.delete("/:providerId/block-time/:blockTimeId", verifyToken, blockTimeController.deleteBlockTime)

module.exports = router
