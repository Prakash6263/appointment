const express = require("express")
const { verifyToken } = require("../middleware/auth")
const { requireRole } = require("../middleware/role.middleware")
const planController = require("../controllers/planController")

const router = express.Router()

// All admin routes require platform_admin role
router.use(verifyToken)
router.use(requireRole("platform_admin"))

// Plan Management Routes
router.post("/plans", planController.createPlan)
router.put("/plans/:id", planController.updatePlan)
router.get("/plans", planController.listPlans)
router.get("/plans/:id", planController.getPlanById)

module.exports = router
