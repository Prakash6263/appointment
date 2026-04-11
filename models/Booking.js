const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
    },

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider", // better keep consistent with your User model
      required: true,
  
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubService",
      required: true,
    },

    // ✅ ONLY DATE (no time)
    bookingDate: {
      type: Date,
      required: true,
  
    },

    // ✅ SLOT (IMPORTANT 🔥)
    startTime: {
      type: String, // "10:00"
      required: true,
    },

    endTime: {
      type: String, // "11:00"
      required: true,
    },

    // ✅ OPTIONAL (better performance for comparisons)
    startMinutes: {
      type: Number, // 600
    },

    endMinutes: {
      type: Number, // 660
    },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "PENDING",
      index: true,
    },

    isNewCustomerBooking: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


// 🔥 IMPORTANT INDEX (for fast conflict check)
bookingSchema.index({ providerId: 1, bookingDate: 1 });


// 🔥 Auto-calculate minutes before save
bookingSchema.pre("save", function (next) {
  const toMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  if (this.startTime) this.startMinutes = toMinutes(this.startTime);
  if (this.endTime) this.endMinutes = toMinutes(this.endTime);

  // Normalize date (important)
  if (this.bookingDate) {
    this.bookingDate.setHours(0, 0, 0, 0);
  }

  next();
});

module.exports = mongoose.model("Booking", bookingSchema);