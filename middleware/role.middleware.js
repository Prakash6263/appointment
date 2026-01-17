// Middleware to check if user has required role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      })
    }

    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Required role(s): ${roles.join(", ")}`,
      })
    }

    next()
  }
}

module.exports = { requireRole }
