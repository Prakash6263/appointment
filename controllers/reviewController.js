

const Booking = require("../models/Booking");
const Review = require("../models/Review");
const updateProviderRating = require("../utils/updateProviderRating");
const updateServiceRating = require("../utils/updateServiceRating");

exports.createReview = async (req, res) => {
  try {
    const { serviceId, bookingId, ratingService, ratingProvider, comment } = req.body;
    const userId = req.userId;

    // ================= VALIDATIONS =================
    if (!serviceId || !bookingId || !ratingService || !ratingProvider) {
      return res.status(400).json({
        message: "serviceId, bookingId and both rating are required",
      });
    }

    if (ratingService < 1 || ratingService > 5) {
      return res.status(400).json({
        message: "ratingService must be between 1 and 5",
      });
    }

     if (ratingProvider < 1 || ratingProvider > 5) {
      return res.status(400).json({
        message: "ratingProvider must be between 1 and 5",
      });
    }

    // ================= FIND BOOKING =================
    const bookingData = await Booking.findById(bookingId);

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

    // ================= GET PROVIDER =================
    const providerId = bookingData.providerId;

    // ================= CREATE REVIEW =================
const review = await Review.create({
  user: userId,
  provider: bookingData.providerId,
  service: serviceId,
  booking: bookingId,
  ratingService,
  ratingProvider,
  comment,
});

    // ================= UPDATE SERVICE RATING =================
    await updateServiceRating(serviceId);

    // ================= UPDATE PROVIDER RATING =================
    await updateProviderRating(providerId);

    // ================= UPDATE BOOKING =================
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
    const mongoose = require("mongoose");

    // ✅ Validate ID
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    // ✅ Fetch reviews with user + provider
    const reviews = await Review.find({ service: serviceId })
      .populate("user", "name")
      .populate("provider", "name") // ⭐ IMPORTANT
      .sort({ createdAt: -1 });

    // ✅ Response
    return res.json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {
    console.error("Get service reviews error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get reviews",
    });
  }
};

// ✅ GET REVIEWS OF Provider 
exports.getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;
    const mongoose = require("mongoose");

    // ✅ Validate ID
    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider ID",
      });
    }

    // ✅ Fetch reviews (by provider)
    const reviews = await Review.find({ provider: providerId })
      .populate("user", "name")       // 👤 reviewer
      .populate("service", "name")    // 🛠 service name
      .sort({ createdAt: -1 });

    // ✅ Response
    return res.json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {
    console.error("Get provider reviews error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get reviews",
    });
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