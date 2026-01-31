const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const partnerSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "SUSPENDED"],
      default: "PENDING",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    providers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Provider",
      },
    ],
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationTokenExpires: {
      type: Date,
      select: false,
    },
    businessName: {
      type: String,
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    license: {
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
      },
      planType: {
        type: String,
        enum: ["FREE", "PAID"],
        default: "FREE",
      },
      customerLimit: {
        type: Number,
      },
      usedCustomers: {
        type: Number,
        default: 0,
      },
      providerLimit: {
        type: Number,
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

// Hash password before saving
partnerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Match password method
partnerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// JSON response method
partnerSchema.methods.toJSON = function () {
  const partner = this.toObject()
  delete partner.password
  delete partner.emailVerificationToken
  delete partner.emailVerificationTokenExpires
  return partner
}

module.exports = mongoose.model("Partner", partnerSchema)
