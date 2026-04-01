const mongoose = require("mongoose")

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["Free", "Starter", "Pro", "Enterprise","Enterprise yearly"],
      unique: true,
    },
    shortId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Plan", planSchema)
