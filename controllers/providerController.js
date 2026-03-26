const Booking = require("../models/Booking");
const Provider = require("../models/Provider");

exports.getAllBookings = async (req, res) => {
  // console.log("getAllBookings",req.userId)
  try {
    const providerId = req.userId;
// console.log("req.user:", req);

    // ✅ provider find karo
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }
// console.log("provider", provider);
    // ✅ partnerId se bookings fetch
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

    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // ✅ UTC me aaj ka range
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    // ✅ bookingDate use karo (correct field)
    const bookings = await Booking.find({
      partnerId: provider.partnerId,
      bookingDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate("serviceId", "name")
      .populate("providerId", "name")
      .populate("userId", "name email")
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
      message: "Failed to fetch today bookings",
    });
  }
};
