const Booking = require("../models/Booking");
const Provider = require("../models/Provider");
const limitService = require("../services/limitService");
const mongoose = require("mongoose");
/* =====================================================
   CUSTOMER SIDE API
   User service book karta hai
===================================================== */
const { checkSlotAvailability } = require("../services/slotService");

exports.createBooking = async (req, res) => {
  try {
    const {
      partnerId, providerId, userId, subServiceId,
      bookingDate, startTime, endTime,
    } = req.body;

    // Basic validation
    if (!partnerId || !providerId || !userId || !subServiceId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Slot check
    const slotCheck = await checkSlotAvailability({ providerId, bookingDate, startTime, endTime });
    if (!slotCheck.available) {
      return res.status(400).json({ success: false, message: slotCheck.message });
    }

    // Customer limit logic
    const isNewCustomer = await limitService.isNewCustomerForPartner(partnerId, userId);
    if (isNewCustomer) {
      const isLimitReached = await limitService.isCustomerLimitReached(partnerId);
      if (isLimitReached) {
        return res.status(403).json({ success: false, message: "Customer limit reached. Existing customers can still book." });
      }
      const wasAdded = await limitService.addUniqueCustomer(partnerId, userId);
      if (!wasAdded) {
        return res.status(403).json({ success: false, message: "Customer limit reached. Existing customers can still book." });
      }
    }

    // 🔧 Normalise bookingDate to UTC midnight
    let cleanDateStr = bookingDate;
    if (cleanDateStr.includes('T')) cleanDateStr = cleanDateStr.split('T')[0];
    const [year, month, day] = cleanDateStr.split('-').map(Number);
    const bookingDateUTC = new Date(Date.UTC(year, month - 1, day));

    const toMinutes = (time) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const booking = await Booking.create({
      partnerId,
      providerId,
      userId,
      subServiceId,
      bookingDate: bookingDateUTC,   // ✅ stored as 2026-04-10T00:00:00.000Z
      startTime,
      endTime,
      startMinutes: toMinutes(startTime),
      endMinutes: toMinutes(endTime),
      isNewCustomerBooking: isNewCustomer,
    });

    res.status(201).json({ success: true, message: "Booking created successfully", data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

/* =====================================================
   CUSTOMER SIDE API
   User apni sari bookings dekh sakta hai
===================================================== */
exports.getUserBookings = async (req, res) => {
  // console.log("req",req.userId)
  try {
    // userId token se aa raha hai (verifyToken middleware se)
    const userId = req.userId;

    const bookings = await Booking.find({ userId })
      .populate("subServiceId")
      .populate("partnerId")
      .populate("providerId");

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getUserBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate("partnerId")
      .populate("providerId")
      .populate("userId")
      .populate("subServiceId");

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
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// get completed bookings of user for this service
// controllers/bookingController.js


exports.getCompletedBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const { subServiceId } = req.query;

    // ✅ validation
    if (!subServiceId) {
      return res.status(400).json({
        success: false,
        message: "subServiceId is required",
      });
    }

    // ✅ ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(subServiceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subServiceId",
      });
    }

    // ✅ check subService exists in DB
    const subServiceExists = await mongoose
      .model("SubService")
      .findById(subServiceId);

    if (!subServiceExists) {
      return res.status(404).json({
        success: false,
        message: "SubService not found",
      });
    }

    // ✅ find bookings
    const bookings = await Booking.find({
      userId,
      subServiceId, // ✅ correct field
      status: "COMPLETED",
    })
      .sort({ createdAt: -1 })
      .select("_id subServiceId bookingDate status startTime endTime");

    // ✅ response
    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });

  } catch (error) {
    console.error("Get Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/* =====================================================
   CUSTOMER SIDE API
   User booking cancel kar sakta hai
===================================================== */
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = "CANCELLED";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.rescheduleBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { bookingDate } = req.body;

    if (!bookingDate) {
      return res.status(400).json({
        success: false,
        message: "New booking date is required",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ❌ Prevent invalid actions
    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot reschedule cancelled booking",
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot reschedule completed booking",
      });
    }

    // ✅ Update date
    booking.bookingDate = bookingDate;
    booking.status = "pending"; // reset if needed

    await booking.save();

    res.json({
      success: true,
      message: "Booking rescheduled successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
/* =====================================================
   PARTNER SIDE API
   Partner apni bookings dekh sakta hai
   status filter bhi laga sakta hai
===================================================== */

exports.getTodayBookings = async (req, res) => {
  try {
    const providerId = req.user.id;
    console.log(providerId);
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // ✅ today range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      partnerId: provider.partnerId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate("serviceId", "name")
      .populate("providerId", "name");

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
/* =====================================================
   PARTNER SIDE API
   Partner booking confirm karta hai
===================================================== */
exports.confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = "CONFIRMED";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking confirmed successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   PARTNER SIDE API
   Service complete hone par booking complete karna
===================================================== */
exports.completeBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = "COMPLETED";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking marked as completed",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   ADMIN SIDE API
   Admin sari bookings dekh sakta hai
===================================================== */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId")
      .populate("partnerId")
      .populate("providerId")
      .populate("serviceId");

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   COMMON API
   Single booking details
===================================================== */
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("userId")
      .populate("partnerId")
      .populate("providerId")
      .populate("subServiceId", "name") 

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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.updateBookingStatus = async (req, res) => {
  console.log("api call");

  try {
    const providerUserId = req.userId;
    const { bookingId } = req.params;
    const { status } = req.body;

    const allowedStatus = ["CONFIRMED", "CANCELLED", "COMPLETED"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const provider = await Provider.findOne({
      userId: new mongoose.Types.ObjectId(providerUserId),
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.partnerId.toString() !== provider.partnerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this booking",
      });
    }

    if (["CANCELLED", "COMPLETED"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Booking already ${booking.status}`,
      });
    }

    // 🔥 FIX HERE (NO save)
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Update booking status error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};