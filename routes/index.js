const express = require("express")
const authRoutes = require("./auth")
const profileRoutes = require("./profile")
const legalRoutes = require("./legal")

const router = express.Router()

router.use("/auth", authRoutes)
router.use("/profile", profileRoutes)
router.use("/legal", legalRoutes)

module.exports = router
