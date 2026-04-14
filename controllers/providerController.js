const { default: mongoose } = require("mongoose");
const Booking = require("../models/Booking");
const Provider = require("../models/Provider");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

exports.getAllBookings = async (req, res) => {
 
  try {
    const providerId = req.userId;
   // ✅ FIX
    const provider = await Provider.findOne({ userId: providerId });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const bookings = await Booking.find({
      partnerId: provider.partnerId,
    })
      .populate("serviceId", "name price")
      .populate("providerId", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};


exports.getTodayBookings = async (req, res) => {
  try {
    const providerId = req.userId;

    // ✅ FIX 1: userId se provider find karo
    const provider = await Provider.findOne({
      userId: new mongoose.Types.ObjectId(providerId),
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // ✅ UTC range (correct)
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    // ✅ FIX 2: populate safe (गलत field error avoid)
const bookings = await Booking.find({
  partnerId: provider.partnerId,
  bookingDate: {
    $gte: startOfDay,
    $lte: endOfDay,
  },
})
  .populate("serviceId", "name price")     // service
  .populate("providerId", "name")          // provider
  .populate("userId", "username email")    // ✅ FIX HERE
  .populate("subServiceId", "name")        // optional
  .sort({ bookingDate: 1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Today bookings error:", error);

    res.status(500).json({
      success: false,
      message: error.message, // 🔥 actual error show karo
    });
  }
};


exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate({
        path: "serviceId",
        select: "name price",
        strictPopulate: false, // 🔥 important
      })
      .populate("providerId", "name")
      .populate("userId", "name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Get booking by ID error:", error);

    res.status(500).json({
      success: false,
      message: error.message, // 🔥 real error
    });
  }
};


