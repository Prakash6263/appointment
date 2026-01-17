const mongoose = require("mongoose")

const providerAvailabilitySchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isOnlineAvailable: {
      type: Boolean,
      default: true,
    },
    weeklySchedule: [
      {
        day: {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          required: true,
        },
        enabled: {
          type: Boolean,
          default: true,
        },
        start: {
          type: String,
          required: true,
          default: "08:00",
        },
        end: {
          type: String,
          required: true,
          default: "16:00",
        },
      },
    ],
  },
  { timestamps: true },
)

// Ensure unique provider availability per provider
providerAvailabilitySchema.index({ providerId: 1 }, { unique: true })

module.exports = mongoose.model("ProviderAvailability", providerAvailabilitySchema)
