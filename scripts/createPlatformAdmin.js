const mongoose = require("mongoose")
const User = require("../models/User")
require("dotenv").config()

const createPlatformAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("MongoDB connected")

    // Check if platform_admin already exists
    const existingAdmin = await User.findOne({ role: "platform_admin" })
    if (existingAdmin) {
      console.log("Platform admin already exists")
      process.exit(1)
    }

    // Get email and password from environment or command line args
    const adminEmail = process.env.ADMIN_EMAIL || process.argv[2]
    const adminPassword = process.env.ADMIN_PASSWORD || process.argv[3]

    if (!adminEmail || !adminPassword) {
      console.log("Error: Email and password required")
      console.log("Usage: node scripts/createPlatformAdmin.js <email> <password>")
      console.log("Or set ADMIN_EMAIL and ADMIN_PASSWORD environment variables")
      process.exit(1)
    }

    // Create platform admin
    const admin = new User({
      email: adminEmail,
      password: adminPassword,
      role: "platform_admin",
      isEmailVerified: true,
    })

    await admin.save()

    console.log("Platform admin created successfully")
    console.log(`Email: ${adminEmail}`)

    process.exit(0)
  } catch (error) {
    console.error("Error creating platform admin:", error)
    process.exit(1)
  }
}

createPlatformAdmin()
