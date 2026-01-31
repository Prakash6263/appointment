const jwt = require("jsonwebtoken")

const verifyPartnerToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== "PARTNER") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Partner access required",
      })
    }

    req.partnerId = decoded.partnerId
    req.userId = decoded.userId
    req.userRole = decoded.role
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    })
  }
}

module.exports = { verifyPartnerToken }
