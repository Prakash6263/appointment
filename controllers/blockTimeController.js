const BlockTime = require("../models/BlockTime");
const User = require("../models/User");

// ===================== Create Block Time =====================
const createBlockTime = async (req, res) => {
  try {
    const { providerId } = req.params;
    const {
      date,
      startTime,
      endTime,
      reason,
      isRecurring,
      recurringPattern,
    } = req.body;

    const { userId, userRole } = req;

    // ✅ 1. Provider check
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== "provider") {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // ✅ 2. Authorization
    if (
      userRole !== "partner_admin" &&
      userId.toString() !== providerId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create block time",
      });
    }

    // ✅ 3. Required fields
    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "date, startTime, and endTime are required",
      });
    }

    // ✅ 4. Time format validation
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Time must be in HH:mm format (e.g., 14:30)",
      });
    }

    // ✅ 5. Convert time to minutes
    const toMinutes = (time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const start = toMinutes(startTime);
    const end = toMinutes(endTime);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // 🔥 6. FIXED DATE PARSING (IMPORTANT)
    // ❌ DO NOT USE new Date("YYYY-MM-DD")
    const [year, month, day] = date.split("-").map(Number);

    const blockDate = new Date(Date.UTC(year, month - 1, day));

    if (isNaN(blockDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // ✅ 7. Day range for query
    const startOfDay = new Date(blockDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(blockDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // ✅ 8. Prevent overlapping block times
    const existingBlocks = await BlockTime.find({
      providerId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: "active",
    });

    for (const block of existingBlocks) {
      const bStart = toMinutes(block.startTime);
      const bEnd = toMinutes(block.endTime);

      if (start < bEnd && end > bStart) {
        return res.status(400).json({
          success: false,
          message: "Time slot overlaps with an existing block",
        });
      }
    }

    // ✅ 9. Recurring validation
    if (isRecurring && !recurringPattern) {
      return res.status(400).json({
        success: false,
        message: "recurringPattern is required when isRecurring is true",
      });
    }

    // ✅ 10. Create block
    const blockTime = await BlockTime.create({
      providerId,
      date: blockDate,
      startTime,
      endTime,
      reason: reason || null,
      isRecurring: isRecurring || false,
      recurringPattern: recurringPattern || null,
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "Block time created successfully",
      data: blockTime,
    });

  } catch (error) {
    console.error("Create block time error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create block time",
    });
  }
};

// ===================== Get Block Times (for a date range) =====================
const getBlockTimes = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { startDate, endDate } = req.query;
    const { userId, userRole } = req;

    // Verify provider exists
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== "provider") {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // Authorization - only provider or admin can view
    if (userRole !== "partner_admin" && userId !== providerId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view block times for this provider",
      });
    }

    // Build query
    const query = {
      providerId,
      status: "active",
    };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        query.date = {
          $gte: start,
          $lte: end,
        };
      }
    }

    const blockTimes = await BlockTime.find(query).sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      message: "Block times retrieved successfully",
      data: blockTimes,
    });
  } catch (error) {
    console.error("Get block times error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get block times",
    });
  }
};

// ===================== Get Block Times for Specific Date =====================
const getBlockTimesByDate = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { date } = req.query;
    const { userId, userRole } = req;

    // Verify provider exists
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

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date query parameter is required",
      });
    }

    const blockDate = new Date(date);
    if (isNaN(blockDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // Get blocks for the specific date
    const startOfDay = new Date(blockDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(blockDate);
    endOfDay.setHours(23, 59, 59, 999);

    const blockTimes = await BlockTime.find({
      providerId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: "active",
    }).sort({ startTime: 1 });

    res.json({
      success: true,
      message: "Block times retrieved successfully",
      data: blockTimes,
    });
  } catch (error) {
    console.error("Get block times by date error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get block times",
    });
  }
};

// ===================== Update Block Time =====================
const updateBlockTime = async (req, res) => {
  try {
    const { providerId, blockTimeId } = req.params;
    const { startTime, endTime, reason } = req.body;
    const { userId, userRole } = req;

    // Verify provider exists
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

    const blockTime = await BlockTime.findById(blockTimeId);
    if (!blockTime || blockTime.providerId.toString() !== providerId) {
      return res.status(404).json({
        success: false,
        message: "Block time not found",
      });
    }

    // Validate time format if provided
    if (startTime || endTime) {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (startTime && !timeRegex.test(startTime)) {
        return res.status(400).json({
          success: false,
          message: "Start time must be in HH:mm format",
        });
      }
      if (endTime && !timeRegex.test(endTime)) {
        return res.status(400).json({
          success: false,
          message: "End time must be in HH:mm format",
        });
      }

      const newStartTime = startTime || blockTime.startTime;
      const newEndTime = endTime || blockTime.endTime;

      const [startHour, startMin] = newStartTime.split(":").map(Number);
      const [endHour, endMin] = newEndTime.split(":").map(Number);
      const startTotalMins = startHour * 60 + startMin;
      const endTotalMins = endHour * 60 + endMin;

      if (endTotalMins <= startTotalMins) {
        return res.status(400).json({
          success: false,
          message: "End time must be after start time",
        });
      }
    }

    // Update fields
    if (startTime) blockTime.startTime = startTime;
    if (endTime) blockTime.endTime = endTime;
    if (reason !== undefined) blockTime.reason = reason;

    await blockTime.save();

    res.json({
      success: true,
      message: "Block time updated successfully",
      data: blockTime,
    });
  } catch (error) {
    console.error("Update block time error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update block time",
    });
  }
};

// ===================== Delete Block Time =====================
const deleteBlockTime = async (req, res) => {
  try {
    const { providerId, blockTimeId } = req.params;
    const { userId, userRole } = req;

    // Verify provider exists
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

    const blockTime = await BlockTime.findById(blockTimeId);
    if (!blockTime || blockTime.providerId.toString() !== providerId) {
      return res.status(404).json({
        success: false,
        message: "Block time not found",
      });
    }

    // Soft delete by changing status
    blockTime.status = "cancelled";
    await blockTime.save();

    res.json({
      success: true,
      message: "Block time deleted successfully",
    });
  } catch (error) {
    console.error("Delete block time error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete block time",
    });
  }
};

module.exports = {
  createBlockTime,
  getBlockTimes,
  getBlockTimesByDate,
  updateBlockTime,
  deleteBlockTime,
};
