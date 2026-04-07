const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    logo: {
      type: String,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    availability: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        isAvailable: {
          type: Boolean,
          default: false,
        },
        startTime: String, // "09:00"
        endTime: String, // "18:00"
      },
    ],
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
    uniqueCustomers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    country: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    websiteName: {
      type: String,
      trim: true,
    },
    passwordResetOTP: {
      type: String,
      select: false,
    },
    passwordResetOTPExpires: {
      type: Date,
      select: false,
    },
    passwordResetAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  { timestamps: true },
);

// Hash password before saving
partnerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Match password method
partnerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// JSON response method
partnerSchema.methods.toJSON = function () {
  const partner = this.toObject();
  delete partner.password;
  delete partner.emailVerificationToken;
  delete partner.emailVerificationTokenExpires;
  delete partner.passwordResetOTP;
  delete partner.passwordResetOTPExpires;
  delete partner.passwordResetAttempts;
  return partner;
};

// Virtual field for remaining customers
partnerSchema.virtual("remainingCustomers").get(function () {
  if (!this.license.customerLimit) return null;
  return Math.max(0, this.license.customerLimit - (this.uniqueCustomers?.length || 0));
});

// Virtual field for remaining providers
partnerSchema.virtual("remainingProviders").get(function () {
  if (!this.license.providerLimit) return null;
  return Math.max(0, this.license.providerLimit - this.license.usedProviders);
});

// Virtual field for customer limit reached
partnerSchema.virtual("customerLimitReached").get(function () {
  if (!this.license.customerLimit) return false;
  return (this.uniqueCustomers?.length || 0) >= this.license.customerLimit;
});

// Virtual field for provider limit reached
partnerSchema.virtual("providerLimitReached").get(function () {
  if (!this.license.providerLimit) return false;
  return this.license.usedProviders >= this.license.providerLimit;
});

module.exports = mongoose.model("Partner", partnerSchema);
