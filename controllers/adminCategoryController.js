const Category = require("../models/Category");
const Service = require("../models/Service");

// =====================
// CREATE CATEGORY (Admin only)
// POST /admin/categories
// =====================
exports.createCategory = async (req, res) => {
  try {
    const { name, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Check for duplicate global name (case-insensitive)
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      isDeleted: false,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
    }

    // Handle icon file upload
    const iconUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const category = await Category.create({
      name: name.trim(),
      icon: iconUrl,
      isActive: isActive !== undefined ? isActive === "true" || isActive === true : true,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Admin create category error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create category",
    });
  }
};

// =====================
// GET ALL CATEGORIES (Admin — includes inactive)
// GET /admin/categories
// =====================
exports.getCategories = async (req, res) => {
  try {
    const { isActive, search } = req.query;

    const filter = { isDeleted: false };
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) filter.name = { $regex: new RegExp(search.trim(), "i") };

    const categories = await Category.find(filter).sort({ name: 1 });

    return res.json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Admin get categories error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get categories",
    });
  }
};

// =====================
// UPDATE CATEGORY (Admin only)
// PUT /admin/categories/:id
// =====================
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const category = await Category.findOne({ _id: id, isDeleted: false });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check duplicate name if name is being changed
    if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
      const duplicate = await Category.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        isDeleted: false,
        _id: { $ne: id },
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "A category with this name already exists",
        });
      }
      category.name = name.trim();
    }

    // Update icon if a new file was uploaded
    if (req.file) {
      category.icon = `/uploads/${req.file.filename}`;
    }

    if (isActive !== undefined) {
      const activeBool = isActive === true || isActive === "true";
      category.isActive = activeBool;

      // Deactivating a category → deactivate all services linked to it
      if (!activeBool) {
        await Service.updateMany(
          { categoryId: id, isDeleted: false },
          { isActive: false }
        );
      }
    }

    await category.save();

    return res.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Admin update category error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update category",
    });
  }
};

// =====================
// SOFT DELETE CATEGORY (Admin only)
// DELETE /admin/categories/:id
// =====================
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({ _id: id, isDeleted: false });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.isDeleted = true;
    category.isActive = false;
    await category.save();

    // Cascade soft-delete all services (across all partners) linked to this category
    await Service.updateMany(
      { categoryId: id, isDeleted: false },
      { isDeleted: true, isActive: false }
    );

    return res.json({
      success: true,
      message: "Category and all linked services deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete category error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete category",
    });
  }
};
