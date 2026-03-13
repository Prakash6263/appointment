const Booking = require("../models/Booking");

/* =====================================================
   CUSTOMER SIDE API
   User service book karta hai
===================================================== */
exports.createBooking = async (req, res) => {
  try {
    const { partnerId, providerId, userId, serviceId, bookingDate } = req.body;

    // Validation
    if (!partnerId || !providerId || !userId || !serviceId || !bookingDate) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create booking with default status PENDING
    const booking = await Booking.create({
      partnerId,
      providerId,
      userId,
      serviceId,
      bookingDate,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
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
   CUSTOMER SIDE API
   User apni sari bookings dekh sakta hai
===================================================== */
exports.getUserBookings = async (req, res) => {
    // console.log("req",req.userId)
  try {

    // userId token se aa raha hai (verifyToken middleware se)
    const userId = req.userId;
    
    const bookings = await Booking.find({ userId })
      .populate("serviceId")
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


/* =====================================================
   PARTNER SIDE API
   Partner apni bookings dekh sakta hai
   status filter bhi laga sakta hai
===================================================== */
exports.getPartnerBookings = async (req, res) => {
  try {

    const { partnerId } = req.params;
    const { status } = req.query;

    let query = { partnerId };

    // Agar status query me diya ho to filter laga do
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate("userId")
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
      .populate("serviceId");

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