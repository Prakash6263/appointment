const Partner = require("../models/Partner")
const fs = require("fs")
const path = require("path")

// Get Branding
exports.getBranding = async (req, res) => {
  try {
    const { userId } = req

    const partner = await Partner.findOne({ ownerUserId: userId })
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    res.json({
      success: true,
      message: "Branding retrieved successfully",
      data: partner.branding,
    })
  } catch (error) {
    console.error("Get branding error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get branding",
    })
  }
}

// Update Branding
exports.updateBranding = async (req, res) => {
  try {
    const { userId } = req
    const { primaryColor, secondaryColor } = req.body

    const partner = await Partner.findOne({ ownerUserId: userId })
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    // Update color branding
    if (primaryColor) partner.branding.primaryColor = primaryColor
    if (secondaryColor) partner.branding.secondaryColor = secondaryColor

    // Handle logo upload
    if (req.files && req.files.logo) {
      const logoFile = req.files.logo[0]

      // Delete old logo if exists
      if (partner.branding.logo) {
        const oldLogoPath = path.join(__dirname, "../uploads", path.basename(partner.branding.logo))
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath)
        }
      }

      partner.branding.logo = `/uploads/${logoFile.filename}`
    }

    // Handle banner uploads
    if (req.files && req.files.banners) {
      const bannerFiles = req.files.banners

      // Delete old banners if exists
      if (partner.branding.bannerImages.length > 0) {
        partner.branding.bannerImages.forEach((banner) => {
          const oldBannerPath = path.join(__dirname, "../uploads", path.basename(banner))
          if (fs.existsSync(oldBannerPath)) {
            fs.unlinkSync(oldBannerPath)
          }
        })
      }

      partner.branding.bannerImages = bannerFiles.map((file) => `/uploads/${file.filename}`)
    }

    await partner.save()

    res.json({
      success: true,
      message: "Branding updated successfully",
      data: partner.branding,
    })
  } catch (error) {
    console.error("Update branding error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update branding",
    })
  }
}
