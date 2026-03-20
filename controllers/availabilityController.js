const ProviderAvailability = require("../models/ProviderAvailability");
const User = require("../models/User")

// Get Provider Availability
const getAvailability = async (req, res) => {
  try {
    const { providerId } = req.params
    const { userId, userRole } = req

    // Check if provider exists
    const provider = await User.findById(providerId)
    if (!provider || provider.role !== "provider") {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      })
    }

    // If not admin, can only view own availability
    if (userRole !== "partner_admin" && userId !== providerId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this provider's availability",
      })
    }

    let availability = await ProviderAvailability.findOne({ providerId })

    // If no availability found, create default one
    if (!availability) {
      const defaultDays = [
        { day: "Monday", enabled: true, start: "08:00", end: "16:00" },
        { day: "Tuesday", enabled: true, start: "08:00", end: "16:00" },
        { day: "Wednesday", enabled: true, start: "08:00", end: "16:00" },
        { day: "Thursday", enabled: true, start: "08:00", end: "16:00" },
        { day: "Friday", enabled: true, start: "08:00", end: "16:00" },
        { day: "Saturday", enabled: false, start: "08:00", end: "16:00" },
        { day: "Sunday", enabled: true, start: "08:00", end: "16:00" },
      ]

      availability = new ProviderAvailability({
        providerId,
        isOnlineAvailable: true,
        weeklySchedule: defaultDays,
      })

      await availability.save()
    }

    res.json({
      success: true,
      message: "Availability retrieved successfully",
      data: availability,
    })
  } catch (error) {
    console.error("Get availability error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get availability",
    })
  }
}

// Update Provider Availability
 const updateAvailability = async (req, res) => {
  try {
    const { providerId } = req.params
    const { isOnlineAvailable, weeklySchedule } = req.body
    const { userId, userRole } = req

    // Check if provider exists
    const provider = await User.findById(providerId)
    if (!provider || provider.role !== "provider") {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      })
    }

    // Only provider or admin can update
    if (userRole !== "partner_admin" && userId !== providerId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this provider's availability",
      })
    }

    // Validate time format
    if (weeklySchedule) {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
      for (const day of weeklySchedule) {
        if (!timeRegex.test(day.start) || !timeRegex.test(day.end)) {
          return res.status(400).json({
            success: false,
            message: "Invalid time format. Use HH:mm format (e.g., 08:00, 16:00)",
          })
        }
      }
    }

    let availability = await ProviderAvailability.findOne({ providerId })

    if (!availability) {
      availability = new ProviderAvailability({ providerId })
    }

    if (isOnlineAvailable !== undefined) {
      availability.isOnlineAvailable = isOnlineAvailable
    }

    if (weeklySchedule) {
      availability.weeklySchedule = weeklySchedule
    }

    await availability.save()

    res.json({
      success: true,
      message: "Availability updated successfully",
      data: availability,
    })
  } catch (error) {
    console.error("Update availability error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update availability",
    })
  }
}

// set Provider Availability
 const setAvailability = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { weeklySchedule, isOnlineAvailable } = req.body;
    const { userId, userRole } = req;

    // Check provider
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== "provider") {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // Authorization
    if (userRole !== "partner_admin" && userId !== providerId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Validate schedule
    if (!Array.isArray(weeklySchedule)) {
      return res.status(400).json({
        success: false,
        message: "weeklySchedule must be an array",
      });
    }

    let availability = await ProviderAvailability.findOne({ providerId });

    if (!availability) {
      availability = new ProviderAvailability({ providerId });
    }

    // Update fields
    if (weeklySchedule) availability.weeklySchedule = weeklySchedule;
    if (isOnlineAvailable !== undefined) {
      availability.isOnlineAvailable = isOnlineAvailable;
    }

    await availability.save();

    res.json({
      success: true,
      message: "Availability set successfully",
      data: availability,
    });
  } catch (error) {
    console.error("Set availability error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to set availability",
    });
  }
};

// delete avalavility Status
 const deleteAvailability = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { userId, userRole } = req;

    // Check provider
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== "provider") {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // Authorization
    if (userRole !== "partner_admin" && userId !== providerId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const availability = await ProviderAvailability.findOneAndDelete({
      providerId,
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    res.json({
      success: true,
      message: "Availability deleted successfully",
    });
  } catch (error) {
    console.error("Delete availability error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete availability",
    });
  }
};
// Toggle Online Status
const toggleOnlineStatus = async (req, res) => {
  try {
    const { providerId } = req.params
    const { userId, userRole } = req

    // Check if provider exists
    const provider = await User.findById(providerId)
    if (!provider || provider.role !== "provider") {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      })
    }

    // Only provider or admin can toggle
    if (userRole !== "partner_admin" && userId !== providerId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to toggle this provider's status",
      })
    }

    let availability = await ProviderAvailability.findOne({ providerId })

    if (!availability) {
      availability = new ProviderAvailability({
        providerId,
        isOnlineAvailable: true,
      })
    }

    availability.isOnlineAvailable = !availability.isOnlineAvailable
    await availability.save()

    res.json({
      success: true,
      message: "Online status toggled successfully",
      data: {
        providerId,
        isOnlineAvailable: availability.isOnlineAvailable,
      },
    })
  } catch (error) {
    console.error("Toggle online status error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle online status",
    })
  }
}

// Update Single Day Schedule
 const updateDaySchedule = async (req, res) => {
  try {
    const { providerId, day } = req.params
    const { enabled, start, end } = req.body
    const { userId, userRole } = req

    // Check if provider exists
    const provider = await User.findById(providerId)
    if (!provider || provider.role !== "provider") {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      })
    }

    // Only provider or admin can update
    if (userRole !== "partner_admin" && userId !== providerId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this provider's schedule",
      })
    }

    // Validate time format
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    if ((start && !timeRegex.test(start)) || (end && !timeRegex.test(end))) {
      return res.status(400).json({
        success: false,
        message: "Invalid time format. Use HH:mm format (e.g., 08:00)",
      })
    }

    let availability = await ProviderAvailability.findOne({ providerId })

    if (!availability) {
      availability = new ProviderAvailability({ providerId })
    }

    const daySchedule = availability.weeklySchedule.find((d) => d.day === day)

    if (!daySchedule) {
      return res.status(404).json({
        success: false,
        message: `Schedule for ${day} not found`,
      })
    }

    if (enabled !== undefined) daySchedule.enabled = enabled
    if (start) daySchedule.start = start
    if (end) daySchedule.end = end

    await availability.save()

    res.json({
      success: true,
      message: `${day} schedule updated successfully`,
      data: availability,
    })
  } catch (error) {
    console.error("Update day schedule error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update day schedule",
    })
  }
}


module.exports = {
  getAvailability,
  updateAvailability,
  setAvailability,
  deleteAvailability,
  toggleOnlineStatus,
  updateDaySchedule
};
