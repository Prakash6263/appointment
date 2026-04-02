const Booking = require("../models/Booking");

// common populate
const populateFields = [
  { path: "userId", select: "name email phoneNumber" },
  { path: "providerId", select: "name" },
  { path: "partnerId", select: "companyName" },
  { path: "serviceId", select: "name price" },
];

//============= Get all bookings ========================//
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate(populateFields)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//============= Get bookings by partnerId ========================//
const getBookingsByPartnerId = async (req, res) => {
  try {
    const { partnerId } = req.params;

    const bookings = await Booking.find({ partnerId })
      .populate(populateFields)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//============= Get bookings by providerId ========================//
const getBookingsByProviderId = async (req, res) => {
  try {
    const { providerId } = req.params;

    const bookings = await Booking.find({ providerId })
      .populate(populateFields)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//============= Get bookings by userId ========================//
const getBookingsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await Booking.find({ userId })
      .populate(populateFields)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getAllBookings,
  getBookingsByPartnerId,
  getBookingsByProviderId,
  getBookingsByUserId,
};