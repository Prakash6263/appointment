const countriesService = require('../services/countriesService');
const geocodeService = require('../services/geocodeService');

// Get all countries
exports.getCountries = async (req, res) => {
  try {
    const countries = await countriesService.getCountries();
    
    res.json({
      success: true,
      message: 'Countries fetched successfully',
      data: countries,
      count: countries.length,
    });
  } catch (error) {
    console.error('Error in getCountries:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch countries',
      data: null,
    });
  }
};

// Get states by country
exports.getStates = async (req, res) => {
  try {
    const { country } = req.body;

    if (!country) {
      return res.status(400).json({
        success: false,
        message: 'Country name is required',
        data: null,
      });
    }

    const states = await countriesService.getStates(country);
    
    res.json({
      success: true,
      message: `States for ${country} fetched successfully`,
      data: states,
      count: states.length,
    });
  } catch (error) {
    console.error('Error in getStates:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch states',
      data: null,
    });
  }
};

// Get cities by country and state
exports.getCities = async (req, res) => {
  try {
    const { country, state } = req.body;

    if (!country || !state) {
      return res.status(400).json({
        success: false,
        message: 'Country and state names are required',
        data: null,
      });
    }

    const cities = await countriesService.getCities(country, state);
    
    res.json({
      success: true,
      message: `Cities for ${state}, ${country} fetched successfully`,
      data: cities,
      count: cities.length,
    });
  } catch (error) {
    console.error('Error in getCities:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch cities',
      data: null,
    });
  }
};

// Geocode location (get coordinates from city/country)
exports.geocodeLocation = async (req, res) => {
  try {
    const { city, country } = req.query;

    if (!city || !country) {
      return res.status(400).json({
        success: false,
        message: 'City and country query parameters are required',
        data: null,
      });
    }

    const coordinates = await geocodeService.geocodeLocation(city, country);
    
    res.json({
      success: true,
      message: `Coordinates for ${city}, ${country} fetched successfully`,
      data: coordinates,
    });
  } catch (error) {
    console.error('Error in geocodeLocation:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to geocode location',
      data: null,
    });
  }
};

// Find nearby places
exports.findNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng, type } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude (lat) and longitude (lng) query parameters are required',
        data: null,
      });
    }

    const placeType = type || 'restaurant';
    const nearbyPlaces = await geocodeService.findNearbyPlaces(lat, lng, placeType);
    
    res.json({
      success: true,
      message: `Nearby ${placeType}s fetched successfully`,
      data: nearbyPlaces,
    });
  } catch (error) {
    console.error('Error in findNearbyPlaces:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to find nearby places',
      data: null,
    });
  }
};

// Reverse geocode (get address from coordinates)
exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude (lat) and longitude (lng) query parameters are required',
        data: null,
      });
    }

    const address = await geocodeService.reverseGeocode(lat, lng);
    
    res.json({
      success: true,
      message: 'Address fetched successfully',
      data: address,
    });
  } catch (error) {
    console.error('Error in reverseGeocode:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reverse geocode',
      data: null,
    });
  }
};
