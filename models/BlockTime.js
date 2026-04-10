const mongoose = require("mongoose");

const blockTimeSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
     
    },
    date: {
      type: Date,
      required: true,
     
    },
    startTime: {
      type: String,
      required: true,
      // Format: HH:mm (e.g., "14:30")
    },
    endTime: {
      type: String,
      required: true,
      // Format: HH:mm (e.g., "16:00")
    },
    reason: {
      type: String,
      default: null,
      // Optional reason for blocking (e.g., "Lunch break", "Personal meeting")
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      // For future use: daily, weekly, monthly, etc.
      type: String,
      enum: ["daily", "weekly", "monthly", null],
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
      
    },
  },
  { timestamps: true }
);

// Index for efficient querying of provider's blocks on a specific date
blockTimeSchema.index({ providerId: 1, date: 1, status: 1 });


module.exports = mongoose.model("BlockTime", blockTimeSchema);
