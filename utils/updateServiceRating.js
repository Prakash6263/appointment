// utils/updateServiceRating.js
const Review = require("../models/Review");
const Service = require("../models/Service");

const updateServiceRating = async (serviceId) => {
  const stats = await Review.aggregate([
    { $match: { service: serviceId } },
    {
      $group: {
        _id: "$service",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Service.findByIdAndUpdate(serviceId, {
      averageRating: stats[0].avgRating,
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await Service.findByIdAndUpdate(serviceId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

module.exports = updateServiceRating;