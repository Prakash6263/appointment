const express = require("express")
const {
  getNotificationPreferences,
  updateNotificationPreferences,
  toggleNotificationPreference,
  getUserNotificationPreferences,
} = require("../controllers/notificationController")
const { verifyToken } = require("../middleware/auth")

const router = express.Router()

// Protected routes
router.get("/preferences", verifyToken, getNotificationPreferences)
router.put("/preferences", verifyToken, updateNotificationPreferences)
router.put("/toggle", verifyToken, toggleNotificationPreference)

// Get specific user preferences (if needed for admin panel)
router.get("/preferences/:userId", verifyToken, getUserNotificationPreferences)

module.exports = router
