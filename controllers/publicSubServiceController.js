// =====================================================
// GET ALL PUBLIC SUB SERVICES
// GET /api/sub-services/public

const Service = require("../models/Service");
const SubService = require("../models/SubService");

// =====================================================
exports.getAllPublicSubServices = async (req, res) => {
  try {
    const { serviceId, gender, categoryId, sortBy } = req.query;

    const filter = {
      isActive: true,
      isDeleted: false,
    };

    if (serviceId) filter.serviceId = serviceId;
    if (categoryId) filter.categoryId = categoryId;

    // gender normalize
    if (gender) {
      const genderMap = {
        male: "men",
        female: "women",
        men: "men",
        women: "women",
        unisex: "unisex",
      };

      const normalizedGender = genderMap[gender.toLowerCase()];
      if (normalizedGender) filter.gender = normalizedGender;
    }

    let subServices = await SubService.find(filter)
      .populate("serviceId", "name")
      .populate("providers", "name specialization")
      .lean();

    // sorting
    if (sortBy === "price_asc") {
      subServices.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      subServices.sort((a, b) => b.price - a.price);
    }

    res.json({
      success: true,
      count: subServices.length,
      data: subServices,
    });

  } catch (error) {
    console.error("Get public subservices error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// =====================================================
// GET SUB SERVICES BY SERVICE ID
// GET /api/sub-services/public/:serviceId
// =====================================================
exports.getSubServicesByService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { gender } = req.query;

    // check service exists
    const service = await Service.findOne({
      _id: serviceId,
      isActive: true,
      isDeleted: false,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const filter = {
      serviceId,
      isActive: true,
      isDeleted: false,
    };

    if (gender) {
      const genderMap = {
        male: "men",
        female: "women",
        men: "men",
        women: "women",
        unisex: "unisex",
      };

      const normalizedGender = genderMap[gender.toLowerCase()];
      if (normalizedGender) filter.gender = normalizedGender;
    }

    const subServices = await SubService.find(filter)
      .populate("providers", "name specialization")
      .sort({ price: 1 });

    res.json({
      success: true,
      serviceId,
      serviceName: service.name,
      count: subServices.length,
      data: subServices,
    });

  } catch (error) {
    console.error("Get subservices by service error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// =====================================================
// GET GROUPED SUB SERVICES (Men/Women Tabs)
// GET /api/sub-services/public/:serviceId/grouped
// =====================================================
exports.getSubServicesGrouped = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const subServices = await SubService.find({
      serviceId,
      isActive: true,
      isDeleted: false,
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
      serviceId,
      data: grouped,
    });

  } catch (error) {
    console.error("Grouped subservices error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// GET SINGLE SUB SERVICE
// GET /api/sub-service/public/:id
// =====================================================
exports.getSubServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const subService = await SubService.findOne({
      _id: id,
      isActive: true,
      isDeleted: false,
    })
      .populate("serviceId", "name")
      .populate("providers", "name specialization");

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
    console.error("Get subservice error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};