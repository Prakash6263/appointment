const express = require("express")
const { verifyToken } = require("../middleware/auth")
const { requireRole } = require("../middleware/role.middleware")
const { ensurePartnerAccess } = require("../middleware/partnerAccess.middleware")
const { validateLicense } = require("../middleware/license.middleware")
const providerController = require("../controllers/providerController")

const router = express.Router()

// All provider routes require partner_admin role and license validation
router.use(verifyToken)
router.use(requireRole("partner_admin"))
router.use(ensurePartnerAccess)
router.use(validateLicense)

// Provider Management Routes
router.post("/", providerController.createProvider)
router.get("/", providerController.listProviders)
router.delete("/:providerId", providerController.deactivateProvider)

module.exports = router
