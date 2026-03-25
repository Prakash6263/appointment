// routes/reviewRoutes.js
const express = require("express");
const router = express.Router();
const {
  createReview,
  getServiceReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const auth = require("../middlewares/authMiddleware");
const { verifyToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/role.middleware");

// create
router.post("/createReview",verifyToken, requireRole("customer"), createReview);

// get reviews by service
router.get("/getReview/:serviceId", getServiceReviews);

// update
router.put("/update/:id", verifyToken, requireRole("customer"), updateReview);

// delete
router.delete("/delete/:id", verifyToken, requireRole("customer"), deleteReview);

module.exports = router;