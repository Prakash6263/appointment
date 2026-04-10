const Partner = require("../models/Partner")
const Provider = require("../models/Provider")
const Service = require("../models/Service")
const Contact = require("../models/Contact");
// =============================
// Get All Services (Customer)
// =============================
const getCustomerServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate("partnerId", "name email phone")

    res.json({
      success: true,
      count: services.length,
      services,
    })
  } catch (error) {
    console.error("Get services error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get services",
    })
  }
}

const getServicesByCity = async (req, res) => {
  try {
    const { city } = req.query;

    let services = [];

    if (city) {
      // ✅ Step 1: find partners in that city
      const partners = await Partner.find({ city });

      const partnerIds = partners.map((p) => p._id);

      // ✅ Step 2: find services of those partners
      services = await Service.find({
        partnerId: { $in: partnerIds },
        isActive: true,
      }).populate("partnerId");
    } else {
      // ✅ No city selected → return ALL services
      services = await Service.find({ isActive: true })
        .populate("partnerId");
    }

    res.json({
      success: true,
      data: services,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// =============================
// Get Service By ID
// =============================
const getServiceById = async (req, res) => {
  try {

    const { id } = req.params

    const service = await Service.findById(id)
      .populate("partnerId", "name email phone")


    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      })
    }

    res.json({
      success: true,
      service,
    })

  } catch (error) {
    console.error("Get service error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get service",
    })
  }
}



// ============================
// Get Providers by Partner ID
// ============================

const getProvidersByPartnerId = async (req, res) => {
  try {

    const { partnerId } = req.params

    const providers = await Provider.find({
      partnerId: partnerId,
      status: "ACTIVE"
    })

    res.status(200).json({
      success: true,
      count: providers.length,
      providers
    })

  } catch (error) {

    console.error("Get providers error:", error)

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch providers"
    })

  }
}

// ============================
// Get Providers by Category ID
// ============================
const getProvidersByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "categoryId is required",
      });
    }

    // Step 1: Find all active, non-deleted services under this category that have at least one provider
    const services = await Service.find({
      categoryId,
      isActive: true,
      isDeleted: false,
      providers: { $exists: true, $not: { $size: 0 } },
    }).select("providers");

    if (!services.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        providers: [],
      });
    }

    // Step 2: Collect unique provider IDs across all matched services
    const providerIdSet = new Set();
    services.forEach((s) => {
      s.providers.forEach((id) => providerIdSet.add(String(id)));
    });

    const uniqueProviderIds = Array.from(providerIdSet);

    // Step 3: Fetch provider documents (active, non-deleted only)
    const providers = await Provider.find({
      _id: { $in: uniqueProviderIds },
      status: "ACTIVE",
      isDeleted: false,
    }).select("-password -emailVerificationToken -emailVerificationExpires");

    // Step 4: For each provider attach the services they offer under this category
    const providerServiceMap = {};
    services.forEach((s) => {
      s.providers.forEach((pId) => {
        const key = String(pId);
        if (!providerServiceMap[key]) providerServiceMap[key] = [];
        providerServiceMap[key].push(s._id);
      });
    });

    const result = providers.map((p) => ({
      ...p.toObject(),
      serviceIds: providerServiceMap[String(p._id)] || [],
    }));

    res.status(200).json({
      success: true,
      count: result.length,
      providers: result,
    });
  } catch (error) {
    console.error("getProvidersByCategory error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch providers for this category",
    });
  }
};

// controllers/contactController.js


const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Contact Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};


module.exports = {
  getCustomerServices,
  getServicesByCity,
  getServiceById,
  getProvidersByPartnerId,
  getProvidersByCategory,
  createContact
}
