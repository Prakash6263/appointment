const express = require("express")
const { getPrivacyPolicy, getTermsAndConditions } = require("../controllers/legalController")

const router = express.Router()

router.get("/privacy-policy", getPrivacyPolicy)
router.get("/terms-and-conditions", getTermsAndConditions)

module.exports = router
