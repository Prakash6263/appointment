const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    // Plan details captured at time of transaction
    planDetails: {
      planName: String,
      customerLimit: Number,
      providerLimit: Number,
    },
    // Payment confirmation details
    paymentMethod: {
      type: String,
      default: "MANUAL",
    },
    paymentConfirmedAt: {
      type: Date,
      default: null,
    },
    paymentConfirmedBy: {
      type: String,
      default: null,
    },
    // Plan activation details
    activatedAt: {
      type: Date,
      default: null,
    },
    planExpiresAt: {
      type: Date,
      default: null,
    },
    // Failure details
    failureReason: {
      type: String,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
    // Customer information
    companyName: String,
    ownerName: String,
    email: String,
    phone: String,
    notes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
)

// Generate unique transaction ID
transactionSchema.pre("save", async function (next) {
  if (this.isNew && !this.transactionId) {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")
    this.transactionId = `TXN-${timestamp}-${random}`
  }
  next()
})

module.exports = mongoose.model("Transaction", transactionSchema)
