const mongoose = require("mongoose")

const partnerSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    license: {
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        required: true,
      },
      planType: {
        type: String,
        enum: ["FREE", "PAID"],
        default: "FREE",
      },
      customerLimit: {
        type: Number,
        required: true,
      },
      usedCustomers: {
        type: Number,
        default: 0,
      },
      providerLimit: {
        type: Number,
        required: true,
      },
      usedProviders: {
        type: Number,
        default: 0,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
    },
    branding: {
      logo: {
        type: String,
        default: null,
      },
      bannerImages: [
        {
          type: String,
        },
      ],
      primaryColor: {
        type: String,
        default: "#000000",
      },
      secondaryColor: {
        type: String,
        default: "#FFFFFF",
      },
    },
    domain: {
      type: {
        type: String,
        enum: ["SUBDOMAIN", "CUSTOM_DOMAIN"],
        default: "SUBDOMAIN",
      },
      domain: {
        type: String,
        unique: true,
        sparse: true,
      },
      sslStatus: {
        type: String,
        enum: ["PENDING", "ACTIVE", "FAILED"],
        default: "PENDING",
      },
      verificationStatus: {
        type: String,
        enum: ["PENDING", "VERIFIED", "FAILED"],
        default: "PENDING",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Partner", partnerSchema)
