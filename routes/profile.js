const express = require("express")
const { getProfile, getUserById, getProviders, getCustomers } = require("../controllers/profileController")
const { verifyToken } = require("../middleware/auth")

const router = express.Router()

router.get("/me", verifyToken, getProfile)
router.get("/user/:userId", getUserById)
router.get("/providers", getProviders)
router.get("/customers", verifyToken, getCustomers)

module.exports = router
