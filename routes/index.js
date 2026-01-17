const express = require("express")
const authRoutes = require("./auth")
const profileRoutes = require("./profile")
const legalRoutes = require("./legal")
const adminRoutes = require("./admin.routes")
const partnerRoutes = require("./partner.routes")
const providerRoutes = require("./provider.routes")
const notificationRoutes = require("./notifications")
const availabilityRoutes = require("./availability")

const router = express.Router()

router.use("/auth", authRoutes)
router.use("/profile", profileRoutes)
router.use("/legal", legalRoutes)
router.use("/admin", adminRoutes)
router.use("/partners", partnerRoutes)
router.use("/providers", providerRoutes)
router.use("/notifications", notificationRoutes)
router.use("/availability", availabilityRoutes)

module.exports = router
