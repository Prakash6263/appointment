const mongoose = require("mongoose")

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    userRole: {
      type: String,
      enum: ["customer", "provider"],
      required: true,
    },
    preferences: {
      bookingUpdates: {
        type: Boolean,
        default: true,
      },
      reviews: {
        type: Boolean,
        default: true,
      },
      activitiesAttractions: {
        type: Boolean,
        default: true,
      },
    },
    notificationChannels: {
      inApp: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("NotificationPreference", notificationPreferenceSchema)
