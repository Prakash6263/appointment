const express = require("express")
const { verifyToken } = require("../middleware/auth")
const { requireRole } = require("../middleware/role.middleware")
const { ensurePartnerAccess } = require("../middleware/partnerAccess.middleware")
const { validateLicense } = require("../middleware/license.middleware")
const partnerController = require("../controllers/partnerController")
const licenseController = require("../controllers/licenseController")
const brandingController = require("../controllers/brandingController")
const domainController = require("../controllers/domainController")

const router = express.Router()

// Partner creation route (only authenticated)
router.post("/", verifyToken, requireRole("customer", "provider"), partnerController.createPartner)

// All other partner routes require partner_admin role
router.use(verifyToken)
router.use(requireRole("partner_admin"))
router.use(ensurePartnerAccess)

// Partner Management Routes
router.get("/", partnerController.getPartner)
router.put("/", partnerController.updatePartner)

// License Management Routes
router.get("/license", licenseController.getPartnerLicense)
router.post("/license/upgrade", licenseController.upgradeLicense)

// Branding Routes (requires license validation)
router.get("/branding", validateLicense, brandingController.getBranding)
router.put("/branding", validateLicense, brandingController.updateBranding)

// Domain Management Routes
router.post("/domain", validateLicense, domainController.addDomain)
router.post("/domain/verify", validateLicense, domainController.verifyDomain)

module.exports = router
