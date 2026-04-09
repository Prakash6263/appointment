const express = require("express")
const authRoutes = require("./auth")
const profileRoutes = require("./profile")
const legalRoutes = require("./legal")
const adminRoutes = require("./admin.routes")
const locationRoutes = require("./locationRoutes")
const publicCategoryController = require("../controllers/publicCategoryController")
const {
  getAllPublicServices,
  getPublicServiceById,
  getServiceProviders,
  getProviderServices,
  getServicesByCategory,
} = require("../controllers/publicServiceController")
const publicSubServiceController = require("../controllers/publicSubServiceController");
const partnerApiRoutes = require("./partnerApi.routes")
const providerRoutes = require("./provider.routes")
const notificationRoutes = require("./notifications")
const availabilityRoutes = require("./availability")
const customerRoutes = require("./customerApi.route")
const purchaseRoutes = require("./purchaseRoutes")

const router = express.Router()

// ===================== PUBLIC CATEGORIES (No Auth Required) ===================== //
router.get("/categories", publicCategoryController.getActiveCategories)

// ===================== PUBLIC SERVICES (No Auth Required) ===================== //
// Get all public services with optional filters (categoryId, partnerId, providerId, city, sortBy)
router.get("/services/public", getAllPublicServices)

// Get all providers of a specific service
router.get("/services/public/:serviceId/providers", getServiceProviders)

// Get all services by category
router.get("/categories/:categoryId/services", getServicesByCategory)

// Get all services of a specific provider
router.get("/providers/:providerId/services", getProviderServices)

// Get service by ID
router.get("/services/public/:id", getPublicServiceById)



// ===================== PUBLIC SUB SERVICES =====================//

// Get all subservices (with filters)
router.get("/sub-services/public", publicSubServiceController.getAllPublicSubServices);

// Get subservices by serviceId
router.get("/sub-services/public/:serviceId", publicSubServiceController.getSubServicesByService);

// Get grouped (Men/Women tabs)
router.get("/sub-services/public/:serviceId/grouped", publicSubServiceController.getSubServicesGrouped);

// Get single subservice
router.get("/sub-service/public/:id", publicSubServiceController.getSubServiceById);





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
