

const Booking = require("../models/Booking");
const Review = require("../models/Review");
const updateServiceRating = require("../utils/updateServiceRating");

exports.createReview = async (req, res) => {
  try {
    const { serviceId, bookingId, rating, comment } = req.body;
    const userId = req.userId; // coming from auth middleware

    // ================= VALIDATIONS =================

    // required fields
    if (!serviceId || !bookingId || !rating) {
      return res.status(400).json({
        message: "serviceId, bookingId and rating are required",
      });
    }

    // rating validation
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // ================= FIND BOOKING =================
    const bookingData = await Booking.findById(bookingId);
// const bookingData = await Booking.findOne({ _id: bookingId });
    if (!bookingData) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // ================= AUTH CHECK =================

    if (bookingData.userId.toString() !== userId) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    // ================= STATUS CHECK =================

    if (bookingData.status !== "COMPLETED") {
      return res.status(400).json({
        message: "You can review only after booking is completed",
      });
    }

    // ================= SERVICE MATCH =================

    if (bookingData.serviceId.toString() !== serviceId) {
      return res.status(400).json({
        message: "Service mismatch for this booking",
      });
    }

    // ================= DUPLICATE CHECK =================

    const existingReview = await Review.findOne({
      user: userId,
      booking: bookingId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You already reviewed this booking",
      });
    }

    // ================= CREATE REVIEW =================

    const review = await Review.create({
      user: userId,
      service: serviceId,
      booking: bookingId,
      rating,
      comment,
    });

    // ================= UPDATE SERVICE RATING =================

    await updateServiceRating(serviceId);

    // ================= OPTIONAL: UPDATE BOOKING =================
    // (recommended for frontend control)

    bookingData.isReviewed = true;
    await bookingData.save();

    // ================= RESPONSE =================

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: review,
    });
  } catch (error) {
    console.error("Create Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ✅ GET REVIEWS OF SERVICE
exports.getServiceReviews = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const reviews = await Review.find({ service: serviceId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE REVIEW
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    await review.save();

    await updateServiceRating(review.service);

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE REVIEW
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await review.deleteOne();

    await updateServiceRating(review.service);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};