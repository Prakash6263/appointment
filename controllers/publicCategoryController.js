const Category = require("../models/Category");

// =====================
// GET ALL ACTIVE CATEGORIES (Public)
// GET /categories
// =====================
exports.getActiveCategories = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = { isDeleted: false, isActive: true };
    if (search) filter.name = { $regex: new RegExp(search.trim(), "i") };

    const categories = await Category.find(filter)
      .select("_id name icon isActive")
      .sort({ name: 1 });

    return res.json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get active categories error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get categories",
    });
  }
};
