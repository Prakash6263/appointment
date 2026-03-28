const Review = require("../models/Review");
const Provider = require("../models/Provider");

const updateProviderRating = async (providerId) => {
  try {
    const stats = await Review.aggregate([
   { $match: { provider: providerId, ratingProvider: { $exists: true } } },
      {
        $group: {
          _id: "$provider",
          avgRating: { $avg: "$ratingProvider" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Provider.findByIdAndUpdate(providerId, {
        averageRating: stats[0].avgRating,
        totalReviews: stats[0].totalReviews,
      });
    } else {
      // ✅ edge case handle (no reviews)
      await Provider.findByIdAndUpdate(providerId, {
        averageRating: 0,
        totalReviews: 0,
      });
    }
  } catch (error) {
    console.error("Provider rating update error:", error);
  }
};

module.exports = updateProviderRating;