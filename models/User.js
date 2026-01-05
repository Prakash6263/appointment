const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      sparse: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["customer", "provider"],
      required: true,
    },

    profileImage: {
      type: String,
      sparse: true,
    },

    contact: {
      type: String,
      sparse: true,
    },
    address: {
      type: String,
      sparse: true,
    },

    firstName: {
      type: String,
      sparse: true,
    },
    lastName: {
      type: String,
      sparse: true,
    },

    // OTP / verification
    otp: String,
    otpExpires: Date,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    resetPasswordOtp: String,
    resetPasswordOtpExpires: Date,

    googleId: {
      type: String,
      sparse: true,
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
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
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// JSON response method
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  delete user.otp
  delete user.resetPasswordOtp
  return user
}

module.exports = mongoose.model("User", userSchema)
