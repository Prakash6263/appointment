const NotificationPreference = require("../models/NotificationPreference")
const User = require("../models/User")

// Get notification preferences for the authenticated user
exports.getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.userId

    let preferences = await NotificationPreference.findOne({ userId })

    if (!preferences) {
      // Create default preferences if they don't exist
      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      preferences = await NotificationPreference.create({
        userId,
        userRole: user.role,
        preferences: {
          bookingUpdates: true,
          reviews: true,
          activitiesAttractions: true,
        },
        notificationChannels: {
          inApp: true,
        },
      })
    }

    res.status(200).json({
      success: true,
      message: "Notification preferences retrieved successfully",
      data: preferences,
    })
  } catch (error) {
    console.error("Error fetching notification preferences:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching notification preferences",
      error: error.message,
    })
  }
}

// Update notification preferences for the authenticated user
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.userId
    const { preferences, notificationChannels } = req.body

    // Validate input
    if (!preferences && !notificationChannels) {
      return res.status(400).json({
        success: false,
        message: "At least one of preferences or notificationChannels must be provided",
      })
    }

    let notificationPref = await NotificationPreference.findOne({ userId })

    if (!notificationPref) {
      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      notificationPref = new NotificationPreference({
        userId,
        userRole: user.role,
      })
    }

    // Update preferences if provided
    if (preferences) {
      notificationPref.preferences = {
        ...notificationPref.preferences,
        ...preferences,
      }
    }

    // Update notification channels if provided
    if (notificationChannels) {
      notificationPref.notificationChannels = {
        ...notificationPref.notificationChannels,
        ...notificationChannels,
      }
    }

    await notificationPref.save()

    res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      data: notificationPref,
    })
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    res.status(500).json({
      success: false,
      message: "Error updating notification preferences",
      error: error.message,
    })
  }
}

// Toggle a specific notification preference
exports.toggleNotificationPreference = async (req, res) => {
  try {
    const userId = req.userId
    const { preferenceType, value } = req.body

    const validPreferences = ["bookingUpdates", "reviews", "activitiesAttractions"]

    if (!validPreferences.includes(preferenceType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid preference type. Must be one of: ${validPreferences.join(", ")}`,
      })
    }

    if (typeof value !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Value must be a boolean",
      })
    }

    let notificationPref = await NotificationPreference.findOne({ userId })

    if (!notificationPref) {
      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      notificationPref = await NotificationPreference.create({
        userId,
        userRole: user.role,
      })
    }

    notificationPref.preferences[preferenceType] = value
    await notificationPref.save()

    res.status(200).json({
      success: true,
      message: `Notification preference '${preferenceType}' updated successfully`,
      data: notificationPref,
    })
  } catch (error) {
    console.error("Error toggling notification preference:", error)
    res.status(500).json({
      success: false,
      message: "Error updating notification preference",
      error: error.message,
    })
  }
}

// Get notification preferences for any user (Admin only - optional)
exports.getUserNotificationPreferences = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    let preferences = await NotificationPreference.findOne({ userId })

    if (!preferences) {
      preferences = await NotificationPreference.create({
        userId,
        userRole: user.role,
      })
    }

    res.status(200).json({
      success: true,
      message: "Notification preferences retrieved successfully",
      data: preferences,
    })
  } catch (error) {
    console.error("Error fetching user notification preferences:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching notification preferences",
      error: error.message,
    })
  }
}
