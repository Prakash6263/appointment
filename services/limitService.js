const Partner = require("../models/Partner");

/**
 * Limit Service - Handles partner subscription limits management
 */

/**
 * Check if customer limit is reached
 * @param {String} partnerId - Partner ID
 * @returns {Promise<Boolean>} - True if limit reached, false otherwise
 */
async function isCustomerLimitReached(partnerId) {
  try {
    const partner = await Partner.findById(partnerId).select("license uniqueCustomers");
    if (!partner || !partner.license.customerLimit) {
      return false; // No limit set
    }
    const uniqueCount = partner.uniqueCustomers?.length || 0;
    return uniqueCount >= partner.license.customerLimit;
  } catch (error) {
    console.error("[limitService] Error checking customer limit:", error.message);
    throw error;
  }
}

/**
 * Check if provider limit is reached
 * @param {String} partnerId - Partner ID
 * @returns {Promise<Boolean>} - True if limit reached, false otherwise
 */
async function isProviderLimitReached(partnerId) {
  try {
    const partner = await Partner.findById(partnerId).select("license");
    if (!partner || !partner.license.providerLimit) {
      return false; // No limit set
    }
    return partner.license.usedProviders >= partner.license.providerLimit;
  } catch (error) {
    console.error("[limitService] Error checking provider limit:", error.message);
    throw error;
  }
}

/**
 * Get remaining customer limit count
 * @param {String} partnerId - Partner ID
 * @returns {Promise<Number|null>} - Remaining count or null if no limit
 */
async function getRemainingCustomerLimit(partnerId) {
  try {
    const partner = await Partner.findById(partnerId).select("license uniqueCustomers");
    if (!partner || !partner.license.customerLimit) {
      return null;
    }
    const uniqueCount = partner.uniqueCustomers?.length || 0;
    return Math.max(0, partner.license.customerLimit - uniqueCount);
  } catch (error) {
    console.error("[limitService] Error getting remaining customer limit:", error.message);
    throw error;
  }
}

/**
 * Get remaining provider limit count
 * @param {String} partnerId - Partner ID
 * @returns {Promise<Number|null>} - Remaining count or null if no limit
 */
async function getRemainingProviderLimit(partnerId) {
  try {
    const partner = await Partner.findById(partnerId).select("license");
    if (!partner || !partner.license.providerLimit) {
      return null;
    }
    return Math.max(0, partner.license.providerLimit - partner.license.usedProviders);
  } catch (error) {
    console.error("[limitService] Error getting remaining provider limit:", error.message);
    throw error;
  }
}

/**
 * Get current limit usage
 * @param {String} partnerId - Partner ID
 * @returns {Promise<Object>} - Usage statistics
 */
async function getLimitUsage(partnerId) {
  try {
    const partner = await Partner.findById(partnerId).select("license uniqueCustomers");
    if (!partner) {
      throw new Error("Partner not found");
    }

    const uniqueCustomerCount = partner.uniqueCustomers?.length || 0;
    const usedProviders = partner.license.usedProviders || 0;
    const customerLimit = partner.license.customerLimit || null;
    const providerLimit = partner.license.providerLimit || null;

    return {
      customers: {
        used: uniqueCustomerCount,
        limit: customerLimit,
        remaining: customerLimit ? Math.max(0, customerLimit - uniqueCustomerCount) : null,
        reached: customerLimit ? uniqueCustomerCount >= customerLimit : false,
      },
      providers: {
        used: usedProviders,
        limit: providerLimit,
        remaining: providerLimit ? Math.max(0, providerLimit - usedProviders) : null,
        reached: providerLimit ? usedProviders >= providerLimit : false,
      },
    };
  } catch (error) {
    console.error("[limitService] Error getting limit usage:", error.message);
    throw error;
  }
}

/**
 * Check if customer is new for a partner (by checking Booking history)
 * @param {String} partnerId - Partner ID
 * @param {String} customerId - Customer (User) ID
 * @returns {Promise<Boolean>} - True if new customer, false if already has bookings
 */
async function isNewCustomerForPartner(partnerId, customerId) {
  try {
    const Booking = require("../models/Booking");
    
    const existingBooking = await Booking.findOne({
      partnerId,
      userId: customerId,
      status: { $in: ["CONFIRMED", "COMPLETED"] }, // Count only successful bookings
    }).select("_id").lean();

    const isNew = !existingBooking;
    console.log(`[limitService] Customer ${customerId} is ${isNew ? "NEW" : "EXISTING"} for partner ${partnerId}`);
    return isNew;
  } catch (error) {
    console.error("[limitService] Error checking if customer is new:", error.message);
    throw error;
  }
}

/**
 * Add customer to unique customers list (ATOMIC operation)
 * Only adds if limit is not reached and customer is new
 * @param {String} partnerId - Partner ID
 * @param {String} customerId - Customer (User) ID
 * @returns {Promise<Boolean>} - True if customer was added, false if limit already reached
 */
async function addUniqueCustomer(partnerId, customerId) {
  try {
    // Atomic operation: Check limit and add customer in one operation
    const partner = await Partner.findByIdAndUpdate(
      partnerId,
      {
        $addToSet: { uniqueCustomers: customerId }, // Only adds if not already present
      },
      { 
        new: true,
        select: "license uniqueCustomers",
      }
    );

    if (!partner) {
      throw new Error("Partner not found");
    }

    const uniqueCount = partner.uniqueCustomers?.length || 0;
    const customerLimit = partner.license?.customerLimit;

    // Check if we exceeded limit after adding
    if (customerLimit && uniqueCount > customerLimit) {
      // Remove the customer we just added since it exceeds limit
      await Partner.findByIdAndUpdate(
        partnerId,
        { $pull: { uniqueCustomers: customerId } }
      );
      console.log(`[limitService] Customer ${customerId} NOT added - limit reached for partner ${partnerId}`);
      return false;
    }

    console.log(`[limitService] Customer ${customerId} added to unique list for partner ${partnerId}. Total: ${uniqueCount}`);
    return true;
  } catch (error) {
    console.error("[limitService] Error adding unique customer:", error.message);
    throw error;
  }
}

/**
 * Track unique customer for partner (DEPRECATED - use isNewCustomerForPartner + addUniqueCustomer)
 * @param {String} partnerId - Partner ID
 * @param {String} customerId - Customer (User) ID
 * @returns {Promise<Boolean>} - True if new customer, false if already tracked
 */
async function trackUniqueCustomer(partnerId, customerId) {
  try {
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      throw new Error("Partner not found");
    }

    if (!partner.uniqueCustomers) {
      partner.uniqueCustomers = [];
    }

    // Check if customer is already tracked
    const isNewCustomer = !partner.uniqueCustomers.includes(customerId);
    if (isNewCustomer) {
      partner.uniqueCustomers.push(customerId);
      await partner.save();
      console.log(`[limitService] New customer tracked: ${customerId} for partner: ${partnerId}`);
    } else {
      console.log(`[limitService] Existing customer: ${customerId} for partner: ${partnerId}`);
    }

    return isNewCustomer;
  } catch (error) {
    console.error("[limitService] Error tracking unique customer:", error.message);
    throw error;
  }
}

/**
 * Increment used providers count
 * @param {String} partnerId - Partner ID
 * @param {Number} count - Number to increment (default 1)
 * @returns {Promise<Number>} - New used providers count
 */
async function incrementUsedProviders(partnerId, count = 1) {
  try {
    const partner = await Partner.findByIdAndUpdate(
      partnerId,
      {
        $inc: { "license.usedProviders": count },
      },
      { new: true }
    ).select("license");

    if (!partner) {
      throw new Error("Partner not found");
    }

    return partner.license.usedProviders;
  } catch (error) {
    console.error("[limitService] Error incrementing used providers:", error.message);
    throw error;
  }
}

/**
 * Decrement used providers count
 * @param {String} partnerId - Partner ID
 * @param {Number} count - Number to decrement (default 1)
 * @returns {Promise<Number>} - New used providers count
 */
async function decrementUsedProviders(partnerId, count = 1) {
  try {
    const partner = await Partner.findById(partnerId).select("license");
    if (!partner) {
      throw new Error("Partner not found");
    }

    const newCount = Math.max(0, partner.license.usedProviders - count);
    await Partner.findByIdAndUpdate(
      partnerId,
      { $set: { "license.usedProviders": newCount } }
    );

    return newCount;
  } catch (error) {
    console.error("[limitService] Error decrementing used providers:", error.message);
    throw error;
  }
}

/**
 * Get partner limit info with all details
 * @param {String} partnerId - Partner ID
 * @returns {Promise<Object>} - Full limit information
 */
async function getPartnerLimitInfo(partnerId) {
  try {
    const partner = await Partner.findById(partnerId).select("license uniqueCustomers");
    if (!partner) {
      throw new Error("Partner not found");
    }

    const uniqueCustomerCount = partner.uniqueCustomers?.length || 0;
    const usedProviders = partner.license.usedProviders || 0;
    const customerLimit = partner.license.customerLimit || null;
    const providerLimit = partner.license.providerLimit || null;

    return {
      license: {
        planType: partner.license.planType,
        isActive: partner.license.isActive,
        expiresAt: partner.license.expiresAt,
      },
      limits: {
        customers: {
          limit: customerLimit,
          used: uniqueCustomerCount,
          remaining: customerLimit ? Math.max(0, customerLimit - uniqueCustomerCount) : null,
          reached: customerLimit ? uniqueCustomerCount >= customerLimit : false,
        },
        providers: {
          limit: providerLimit,
          used: usedProviders,
          remaining: providerLimit ? Math.max(0, providerLimit - usedProviders) : null,
          reached: providerLimit ? usedProviders >= providerLimit : false,
        },
      },
    };
  } catch (error) {
    console.error("[limitService] Error getting partner limit info:", error.message);
    throw error;
  }
}

module.exports = {
  isCustomerLimitReached,
  isProviderLimitReached,
  getRemainingCustomerLimit,
  getRemainingProviderLimit,
  getLimitUsage,
  isNewCustomerForPartner,
  addUniqueCustomer,
  trackUniqueCustomer,
  incrementUsedProviders,
  decrementUsedProviders,
  getPartnerLimitInfo,
};
