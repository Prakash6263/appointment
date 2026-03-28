// utils/updateServiceRating.js

const mongoose = require("mongoose");
const Review = require("../models/Review");
const Service = require("../models/Service");

const updateServiceRating = async (serviceId) => {
  try {
    // ✅ ensure ObjectId (important for aggregation match)
    const serviceObjectId = new mongoose.Types.ObjectId(serviceId);

    const stats = await Review.aggregate([
      { $match: { service: serviceId, ratingService: { $exists: true } } },
      {
        $group: {
          _id: "$service",
          avgRating: { $avg: "$ratingService" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    let updateData = {
      averageRating: 0,
      totalReviews: 0,
    };

    if (stats.length > 0) {
      updateData = {
        averageRating: Number(stats[0].avgRating.toFixed(1)), // ✅ rounded
        totalReviews: stats[0].totalReviews,
      };
    }

    // ✅ single DB call (optimized)
    await Service.findByIdAndUpdate(serviceId, updateData);

  } catch (error) {
    console.error("Service rating update error:", error);
  }
};

module.exports = updateServiceRating;