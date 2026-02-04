const mongoose = require("mongoose")

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["Free", "Starter", "Pro", "Enterprise"],
      unique: true,
    },
    shortId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    billingCycle: {
      type: String,
      enum: ["MONTHLY", "YEARLY"],
      required: true,
    },
    customerLimit: {
      type: Number,
      required: true,
    },
    providerLimit: {
      type: Number,
      required: true,
    },
    features: {
      branding: { type: Boolean, default: false },
      domain: { type: Boolean, default: false },
      analytics: { type: Boolean, default: false },
      customDomain: { type: Boolean, default: false },
      advancedReporting: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Plan", planSchema)
