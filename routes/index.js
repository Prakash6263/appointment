const express = require("express")
const authRoutes = require("./auth")
const profileRoutes = require("./profile")
const legalRoutes = require("./legal")
const adminRoutes = require("./admin.routes")
const locationRoutes = require("./locationRoutes")
const publicCategoryController = require("../controllers/publicCategoryController")

const partnerApiRoutes = require("./partnerApi.routes")
const providerRoutes = require("./provider.routes")
const notificationRoutes = require("./notifications")
const availabilityRoutes = require("./availability")
const customerRoutes = require("./customerApi.route")
const purchaseRoutes = require("./purchaseRoutes")

const router = express.Router()

// ===================== PUBLIC CATEGORIES (No Auth Required) ===================== //
router.get("/categories", publicCategoryController.getActiveCategories)

router.use("/auth", authRoutes)
router.use("/profile", profileRoutes)
router.use("/legal", legalRoutes)
router.use("/admin", adminRoutes)
router.use("/location", locationRoutes)

router.use("/partner", partnerApiRoutes)
router.use("/providers", providerRoutes)
router.use("/customer", customerRoutes);
router.use("/notifications", notificationRoutes)
router.use("/availability", availabilityRoutes)
router.use("/purchase", purchaseRoutes)







module.exports = router
