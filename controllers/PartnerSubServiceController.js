const Service = require("../models/Service");
const SubService = require("../models/SubService");
// ===================== CREATE SUB SERVICE ===================== //
exports.createSubService = async (req, res) => {
  try {
    const { serviceId, name, price, duration, gender } = req.body;
    const partnerId = req.userId;

    // ✅ 1. Validate required fields
    if (!serviceId || !name || !price || !duration) {
      return res.status(400).json({
        success: false,
        message: "serviceId, name, price, duration are required",
      });
    }

    // ✅ 2. Check service exists
    const service = await Service.findOne({
      _id: serviceId,
      isDeleted: false,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // ✅ 3. Ensure partner owns the service
    if (service.partnerId.toString() !== partnerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add subservice to this service",
      });
    }

    // ✅ 4. Prevent duplicate
    const existing = await SubService.findOne({
      serviceId,
      name,
      gender: gender || "unisex",
      partnerId,
      isDeleted: false,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "SubService already exists for this service & gender",
      });
    }

    // ✅ 5. Create subservice
    const subService = await SubService.create({
      serviceId,
      categoryId: service.categoryId, // 🔥 auto map
      partnerId,
      name,
      price,
      duration,
      gender: gender || "unisex",
      image: req.file ? `/uploads/${req.file.filename}` : ""
    });

    res.status(201).json({
      success: true,
      message: "SubService created successfully",
      data: subService,
    });

  } catch (error) {
    console.error("Create SubService error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create subservice",
    });
  }
};



// ===================== GET ALL SUB SERVICES ===================== //
exports.getSubServices = async (req, res) => {
  try {
    const { serviceId, gender } = req.query;
    const partnerId = req.userId;

    const filter = {
      partnerId,
      isDeleted: false,
    };

    if (serviceId) filter.serviceId = serviceId;
    if (gender) filter.gender = gender;

    const subServices = await SubService.find(filter)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: subServices,
    });

  } catch (error) {
    console.error("Get SubServices error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch subservices",
    });
  }
};



// ===================== GET SUB SERVICE BY ID ===================== //
exports.getSubServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.userId;

    const subService = await SubService.findOne({
      _id: id,
      partnerId,
      isDeleted: false,
    });

    if (!subService) {
      return res.status(404).json({
        success: false,
        message: "SubService not found",
      });
    }

    res.json({
      success: true,
      data: subService,
    });

  } catch (error) {
    console.error("Get SubService error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch subservice",
    });
  }
};



// ===================== UPDATE SUB SERVICE ===================== //
exports.updateSubService = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.userId;

    const subService = await SubService.findOne({
      _id: id,
      partnerId,
      isDeleted: false,
    });

    if (!subService) {
      return res.status(404).json({
        success: false,
        message: "SubService not found",
      });
    }

    // ✅ Update fields
    const updates = req.body;

    if (req.file) {
      updates.image = req.file.path;
    }

    const updated = await SubService.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    res.json({
      success: true,
      message: "SubService updated successfully",
      data: updated,
    });

  } catch (error) {
    console.error("Update SubService error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update subservice",
    });
  }
};



// ===================== DELETE (SOFT) ===================== //
exports.deleteSubService = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.userId;

    const subService = await SubService.findOne({
      _id: id,
      partnerId,
      isDeleted: false,
    });

    if (!subService) {
      return res.status(404).json({
        success: false,
        message: "SubService not found",
      });
    }

    subService.isDeleted = true;
    await subService.save();

    res.json({
      success: true,
      message: "SubService deleted successfully",
    });

  } catch (error) {
    console.error("Delete SubService error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete subservice",
    });
  }
};



// ===================== GROUPED (MEN / WOMEN) ===================== //
exports.getSubServicesGrouped = async (req, res) => {
  try {
    const { serviceId } = req.query;
    const partnerId = req.userId;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "serviceId is required",
      });
    }

    const subServices = await SubService.find({
      serviceId,
      partnerId,
      isDeleted: false,
      isActive: true,
    });

    const grouped = {
      men: [],
      women: [],
      unisex: [],
    };

    subServices.forEach((item) => {
      grouped[item.gender].push(item);
    });

    res.json({
      success: true,
      data: grouped,
    });

  } catch (error) {
    console.error("Grouped SubService error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch grouped subservices",
    });
  }
};