const Booking = require("../models/Booking")
const Provider = require("../models/Provider")
const Service = require("../models/Service")

// Get All Bookings for Partner
exports.getBookings = async (req, res) => {
  try {
    const { status } = req.query

    let query = { partnerId: req.partnerId }

    if (status) {
      query.status = status
    }

    const bookings = await Booking.find(query)
      .populate("providerId", "name email phone")
      .populate("userId", "email username")
      .populate("serviceId", "name price duration")
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    })
  } catch (error) {
    console.error("Get bookings error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get bookings",
    })
  }
}

// Update Booking Status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    // Validation
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      })
    }

    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      })
    }

    // Check if booking belongs to this partner
    const booking = await Booking.findOne({ _id: id, partnerId: req.partnerId })
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or does not belong to this partner",
      })
    }

    // Update booking status
    booking.status = status
    await booking.save()

    // Populate details before sending response
    await booking.populate("providerId", "name email phone")
    await booking.populate("userId", "email username")
    await booking.populate("serviceId", "name price duration")

    res.json({
      success: true,
      message: "Booking status updated successfully",
      booking,
    })
  } catch (error) {
    console.error("Update booking status error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update booking status",
    })
  }
}
