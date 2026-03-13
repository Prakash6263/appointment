const Provider = require("../models/Provider")
const Service = require("../models/Service")

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



module.exports = {
  getCustomerServices,
  getServiceById,
  getProvidersByPartnerId
}