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

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City is required",
      });
    }

    // ✅ Step 1: find partners in that city
    const partners = await Partner.find({ city });

    const partnerIds = partners.map((p) => p._id);

    // ✅ Step 2: find services of those partners
    const services = await Service.find({
      partnerId: { $in: partnerIds },
      isActive: true,
    }).populate("partnerId"); // optional (for company name etc)

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
  createContact
}