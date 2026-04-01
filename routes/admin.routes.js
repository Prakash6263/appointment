const express = require("express")
const { verifyToken } = require("../middleware/auth")
const { requireRole } = require("../middleware/role.middleware")
const planController = require("../controllers/planController")

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

module.exports = router
