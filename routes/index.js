const express = require("express")
const authRoutes = require("./auth")
const profileRoutes = require("./profile")
const legalRoutes = require("./legal")
const adminRoutes = require("./admin.routes")
const locationRoutes = require("./locationRoutes")

const partnerApiRoutes = require("./partnerApi.routes")
// const providerRoutes = require("./provider.routes")
const notificationRoutes = require("./notifications")
const availabilityRoutes = require("./availability")
const bookingRoutes = require("./booking.Routes")
const customerRoutes = require("./customerApi.route")

const router = express.Router()

router.use("/auth", authRoutes)
router.use("/profile", profileRoutes)
router.use("/legal", legalRoutes)
router.use("/admin", adminRoutes)
router.use("/location", locationRoutes)

router.use("/", partnerApiRoutes)
// router.use("/providers", providerRoutes)
router.use("/notifications", notificationRoutes)
router.use("/availability", availabilityRoutes)


router.use("/bookings", bookingRoutes);

router.use("/customer", customerRoutes);



module.exports = router
