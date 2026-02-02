const Partner = require("../models/Partner")
const Service = require("../models/Service")

// Create Service
exports.createService = async (req, res) => {
  try {
    const { name, description, price, duration } = req.body

    // Validation
    if (!name || !description || price === undefined || !duration) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    if (price < 0 || duration < 0) {
      return res.status(400).json({
        success: false,
        message: "Price and duration must be positive numbers",
      })
    }

    // Create service
    const service = new Service({
      partnerId: req.partnerId,
      name,
      description,
      price,
      duration,
      isActive: true,
    })

    await service.save()

    // Add service to partner's services list
    await Partner.findByIdAndUpdate(req.partnerId, {
      $push: { services: service._id },
    })

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    })
  } catch (error) {
    console.error("Create service error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create service",
    })
  }
}

// Get All Services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({ partnerId: req.partnerId })

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

// Update Service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, price, duration, isActive } = req.body

    // Check if service belongs to this partner
    const service = await Service.findOne({ _id: id, partnerId: req.partnerId })
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or does not belong to this partner",
      })
    }

    // Validate update data
    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number",
      })
    }

    if (duration !== undefined && duration < 0) {
      return res.status(400).json({
        success: false,
        message: "Duration must be a positive number",
      })
    }

    // Update service
    const updatedService = await Service.findByIdAndUpdate(
      id,
      {
        name: name || service.name,
        description: description || service.description,
        price: price !== undefined ? price : service.price,
        duration: duration || service.duration,
        isActive: isActive !== undefined ? isActive : service.isActive,
      },
      { new: true, runValidators: true },
    )

    res.json({
      success: true,
      message: "Service updated successfully",
      service: updatedService,
    })
  } catch (error) {
    console.error("Update service error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update service",
    })
  }
}

// Delete Service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params

    // Check if service belongs to this partner
    const service = await Service.findOne({ _id: id, partnerId: req.partnerId })
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or does not belong to this partner",
      })
    }

    // Delete service
    await Service.findByIdAndDelete(id)

    // Remove service from partner's services list
    await Partner.findByIdAndUpdate(req.partnerId, {
      $pull: { services: id },
    })

    res.json({
      success: true,
      message: "Service deleted successfully",
    })
  } catch (error) {
    console.error("Delete service error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete service",
    })
  }
}
