const Service = require("../models/Service");
const Provider = require("../models/Provider");
const Partner = require("../models/Partner");
const Category = require("../models/Category");

// =====================================================
// GET ALL PUBLIC SERVICES (No Auth Required)
// GET /api/services/public
// =====================================================
const getAllPublicServices = async (req, res) => {
  try {
    const { categoryId, partnerId, providerId, city, sortBy } = req.query;

    // Build filter - only get active, non-deleted services
    const filter = {
      isActive: true,
      isDeleted: false,
    };

    if (categoryId) filter.categoryId = categoryId;
    if (partnerId) filter.partnerId = partnerId;

    // Get services
    let services = await Service.find(filter)
      .populate("partnerId", "name email phone city")
      .populate("categoryId", "name icon")
      .lean();

    // If providerId provided, filter services by providers array
    if (providerId) {
      services = services.filter((service) =>
        service.providers.some((pid) => pid.toString() === providerId)
      );
    }

    // If city provided, filter by partner city
    if (city) {
      services = services.filter(
        (service) => service.partnerId?.city?.toLowerCase() === city.toLowerCase()
      );
    }

    // Sort functionality
    if (sortBy === "price_asc") {
      services.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      services.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating_desc") {
      services.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sortBy === "newest") {
      services.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get public services error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get services",
    });
  }
};

// =====================================================
// GET SERVICE BY ID (Public - No Auth Required)
// GET /api/services/public/:id
// =====================================================
const getPublicServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findOne({
      _id: id,
      isActive: true,
      isDeleted: false,
    })
      .populate("partnerId", "name email phone city website")
      .populate("categoryId", "name icon")
      .populate("providers", "name email phone specialization profileImage averageRating experience");

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Get public service error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get service",
    });
  }
};

// =====================================================
// GET ALL PROVIDERS OF A SERVICE (Public - No Auth Required)
// GET /api/services/public/:serviceId/providers
// =====================================================
const getServiceProviders = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findOne({
      _id: serviceId,
      isActive: true,
      isDeleted: false,
    }).populate("providers", "name email phone specialization profileImage averageRating totalReviews experience status");

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Filter only active providers
    const activeProviders = service.providers.filter((p) => p.status === "ACTIVE" && !p.isDeleted);

    return res.json({
      success: true,
      serviceId,
      serviceName: service.name,
      totalProviders: activeProviders.length,
      providers: activeProviders,
    });
  } catch (error) {
    console.error("Get service providers error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get providers",
    });
  }
};

// =====================================================
// GET ALL SERVICES BY PROVIDER (Public - No Auth Required)
// GET /api/services/public/provider/:providerId
// =====================================================
const getProviderServices = async (req, res) => {
  try {
    const { providerId } = req.params;

    // Verify provider exists and is active
    const provider = await Provider.findOne({
      _id: providerId,
      isDeleted: false,
      status: "ACTIVE",
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found or inactive",
      });
    }

    // Get all services assigned to this provider
    const services = await Service.find({
      providers: providerId,
      isActive: true,
      isDeleted: false,
    })
      .populate("partnerId", "name email phone city website")
      .populate("categoryId", "name icon")
      .lean();

    return res.json({
      success: true,
      providerId,
      providerName: provider.name,
      providerEmail: provider.email,
      providerSpecialization: provider.specialization,
      providerRating: provider.averageRating,
      totalServices: services.length,
      services,
    });
  } catch (error) {
    console.error("Get provider services error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get provider services",
    });
  }
};

// =====================================================
// GET SERVICES BY CATEGORY (Public - No Auth Required)
// GET /api/services/public/category/:categoryId
// =====================================================
const getServicesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { city, sortBy } = req.query;

    // Verify category exists and is active
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

    // Build filter
    const filter = {
      categoryId,
      isActive: true,
      isDeleted: false,
    };

    let services = await Service.find(filter)
      .populate("partnerId", "name email phone city")
      .populate("categoryId", "name icon")
      .lean();

    // Filter by city if provided
    if (city) {
      services = services.filter(
        (service) => service.partnerId?.city?.toLowerCase() === city.toLowerCase()
      );
    }

    // Sort functionality
    if (sortBy === "price_asc") {
      services.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      services.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating_desc") {
      services.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sortBy === "newest") {
      services.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.json({
      success: true,
      categoryId,
      categoryName: category.name,
      totalServices: services.length,
      services,
    });
  } catch (error) {
    console.error("Get services by category error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get services",
    });
  }
};

module.exports = {
  getAllPublicServices,
  getPublicServiceById,
  getServiceProviders,
  getProviderServices,
  getServicesByCategory,
};
