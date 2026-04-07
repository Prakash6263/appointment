const express = require("express")
// import {} from './../controllers/adminCostomerController';
const { verifyToken } = require("../middleware/auth")
const { requireRole } = require("../middleware/role.middleware")
const planController = require("../controllers/planController")
const { listUsers, getUserById, deleteUser,toggleUserStatus  } = require("../controllers/adminCustomerController")
const { getAllBookings, getBookingsByProviderId, getBookingsByPartnerId, getBookingsByUserId } = require("../controllers/adminBookingController")
const adminCategoryController = require("../controllers/adminCategoryController")
const upload = require("../middleware/multer")

const router = express.Router()

// All admin routes require platform_admin role
router.use(verifyToken)
router.use(requireRole("platform_admin"))

// Plan Management Routes
router.post("/createPlans", verifyToken, requireRole("platform_admin"), planController.createPlan)
router.put("/plans/:id", verifyToken, requireRole("platform_admin"), planController.updatePlan)
router.get("/plans", verifyToken, requireRole("platform_admin"), planController.listPlans)
router.get("/plans/:id", verifyToken, requireRole("platform_admin"), planController.getPlanById)
router.delete("/plans/:id", verifyToken, requireRole("platform_admin"), planController.deletePlan); 


// User Management Routes
router.get("/allUsers", verifyToken, requireRole("platform_admin"), listUsers);
router.get("/users/:id", verifyToken, requireRole("platform_admin"), getUserById);
router.delete("/users/:id", verifyToken, requireRole("platform_admin"), deleteUser);
router.patch("/users/:id/toggle-status", verifyToken, requireRole("platform_admin"), toggleUserStatus);

// ===================== CATEGORY MANAGEMENT =====================//
router.post("/categories", upload.single("icon"), adminCategoryController.createCategory)
router.get("/categories", adminCategoryController.getCategories)
router.put("/categories/:id", upload.single("icon"), adminCategoryController.updateCategory)
router.delete("/categories/:id", adminCategoryController.deleteCategory)

// Booking Management Routes
router.get("/allBookings", verifyToken, requireRole("platform_admin"), getAllBookings);
router.get("/bookings/partner/:partnerId", verifyToken, getBookingsByPartnerId);
router.get("/bookings/provider/:providerId", verifyToken, getBookingsByProviderId);
router.get("/bookings/user/:userId", verifyToken, getBookingsByUserId);

module.exports = router
