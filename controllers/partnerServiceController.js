const Partner = require("../models/Partner");
const Service = require("../models/Service");
const Category = require("../models/Category");

// =====================
// CREATE SERVICE
// POST /partner/services
// =====================
exports.createService = async (req, res) => {
  try {
    const { name, description, price, duration, categoryId, providers, gender } = req.body;
    const partnerId = req.partnerId;

    // ── Validation ──
    if (!name || !description || price === undefined || !duration || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "name, description, price, duration, and categoryId are required",
      });
    }

    if (Number(price) < 0 || Number(duration) < 1) {
      return res.status(400).json({
        success: false,
        message: "Price must be >= 0 and duration must be >= 1",
      });
    }

    // ── Validate categoryId is a global active category ──
    const category = await Category.findOne({
      _id: categoryId,
      isDeleted: false,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found or inactive",
      });
    }

    // ── Prevent duplicate service name in same category ──
    const duplicate = await Service.findOne({
      partnerId,
      categoryId,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      isDeleted: false,
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "A service with this name already exists in the selected category",
      });
    }

    // ── Image handling ──
    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // ── Parse providers (form-data sends it as a JSON string) ──
    let parsedProviders = [];
    if (providers) {
      try {
        parsedProviders = typeof providers === "string" ? JSON.parse(providers) : providers;
        if (!Array.isArray(parsedProviders)) parsedProviders = [parsedProviders];
      } catch {
        return res.status(400).json({ success: false, message: "providers must be a valid JSON array" });
      }
    }

    // ── Normalise gender (accept "male"/"female" aliases) ──
    const genderMap = { male: "men", female: "women", men: "men", women: "women", unisex: "unisex" };
    const normalizedGender = genderMap[(gender || "unisex").toLowerCase()] || "unisex";

    // ── Create service ──
    const service = await Service.create({
      partnerId,
      categoryId,
      name: name.trim(),
      description,
      price: Number(price),
      duration: Number(duration),
      image: imageUrl,
      providers: parsedProviders,
      gender: normalizedGender,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("Create service error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create service",
    });
  }
};

// =====================
// GET ALL SERVICES
// GET /partner/services?categoryId=&isActive=
// =====================
exports.getServices = async (req, res) => {
  try {
    const partnerId = req.partnerId;
    const { categoryId, isActive } = req.query;

    const filter = { partnerId, isDeleted: false };
    if (categoryId) filter.categoryId = categoryId;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    

    const services = await Service.find(filter)
      .populate("categoryId", "name isActive")
      .sort({ createdAt: -1 });

    // Reshape: expose `category` key for friendly response
    const formatted = services.map((s) => {
      const obj = s.toObject();
      obj.category = obj.categoryId;
      delete obj.categoryId;
      return obj;
    });

    return res.json({
      success: true,
      count: formatted.length,
      services: formatted,
    });
  } catch (error) {
    console.error("Get services error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get services",
    });
  }
};

// =====================
// GET SERVICE BY ID
// GET /partner/services/:id
// =====================
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.partnerId;

    const service = await Service.findOne({ _id: id, partnerId, isDeleted: false }).populate(
      "categoryId",
      "name isActive"
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const obj = service.toObject();
    obj.category = obj.categoryId;
    delete obj.categoryId;

    return res.json({
      success: true,
      service: obj,
    });
  } catch (error) {
    console.error("Get service by ID error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get service",
    });
  }
};

// =====================
// UPDATE SERVICE
// PUT /partner/services/:id
// =====================
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.partnerId;
    const { name, description, price, duration, categoryId, providers, gender, isActive } =
      req.body;

    const service = await Service.findOne({ _id: id, partnerId, isDeleted: false });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or does not belong to this partner",
      });
    }

    // ── Validate new categoryId if provided ──
    if (categoryId && categoryId !== String(service.categoryId)) {
      const category = await Category.findOne({
        _id: categoryId,
        isDeleted: false,
        isActive: true,
      });
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Target category not found or inactive",
        });
      }
      service.categoryId = categoryId;
    }

    // ── Check duplicate name if name or category changes ──
    const newName = name ? name.trim() : service.name;
    const newCategoryId = categoryId || service.categoryId;

    if (name || categoryId) {
      const duplicate = await Service.findOne({
        partnerId,
        categoryId: newCategoryId,
        name: { $regex: new RegExp(`^${newName}$`, "i") },
        isDeleted: false,
        _id: { $ne: id },
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "A service with this name already exists in the selected category",
        });
      }
    }

    if (price !== undefined && Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be >= 0",
      });
    }
    if (duration !== undefined && Number(duration) < 1) {
      return res.status(400).json({
        success: false,
        message: "Duration must be >= 1",
      });
    }

    // ── Image handling ──
    if (req.file) {
      service.image = `/uploads/${req.file.filename}`;
    }

    // ── Parse providers (form-data sends it as a JSON string) ──
    if (providers !== undefined) {
      try {
        let parsedProviders = typeof providers === "string" ? JSON.parse(providers) : providers;
        if (!Array.isArray(parsedProviders)) parsedProviders = [parsedProviders];
        service.providers = parsedProviders;
      } catch {
        return res.status(400).json({ success: false, message: "providers must be a valid JSON array" });
      }
    }

    // ── Normalise gender (accept "male"/"female" aliases) ──
    const genderMap = { male: "men", female: "women", men: "men", women: "women", unisex: "unisex" };

    if (name) service.name = name.trim();
    if (description) service.description = description;
    if (price !== undefined) service.price = Number(price);
    if (duration !== undefined) service.duration = Number(duration);
    if (gender) service.gender = genderMap[gender.toLowerCase()] || gender;
    if (isActive !== undefined) service.isActive = isActive === "true" || isActive === true;

    await service.save();

    const updated = await Service.findById(service._id).populate("categoryId", "name isActive");
    const obj = updated.toObject();
    obj.category = obj.categoryId;
    delete obj.categoryId;

    return res.json({
      success: true,
      message: "Service updated successfully",
      service: obj,
    });
  } catch (error) {
    console.error("Update service error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update service",
    });
  }
};

// =====================
// SOFT DELETE SERVICE
// DELETE /partner/services/:id
// =====================
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.partnerId;

    const service = await Service.findOne({ _id: id, partnerId, isDeleted: false });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or does not belong to this partner",
      });
    }

    service.isDeleted = true;
    service.isActive = false;
    await service.save();

    return res.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete service",
    });
  }
};

// =====================
// SET PARTNER AVAILABILITY (unchanged)
// =====================
exports.setAvailability = async (req, res) => {
  try {
    const partnerId = req.partnerId;
    const { availability } = req.body;

    const partner = await Partner.findByIdAndUpdate(
      partnerId,
      { availability },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      data: partner.availability,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
