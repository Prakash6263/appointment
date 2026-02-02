const countriesService = require('../services/countriesService');
const geocodeService = require('../services/geocodeService');

/**
 * GET /api/location/countries
 * Fetch all countries
 */
const getCountries = async (req, res) => {
  try {
    const countries = await countriesService.getCountries();
    
    res.status(200).json({
      success: true,
      message: 'Countries fetched successfully',
      data: countries,
      count: countries.length
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
      error: error.error || error
    });
  }
};

/**
 * POST /api/location/states
 * Fetch states for a country
 */
const getStates = async (req, res) => {
  try {
    const { country } = req.body;

    if (!country) {
      return res.status(400).json({
        success: false,
        message: 'Country name is required in request body'
      });
    }

    const states = await countriesService.getStates(country);
    
    res.status(200).json({
      success: true,
      message: `States for ${country} fetched successfully`,
      country,
      data: states,
      count: states.length
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
      error: error.error || error
    });
  }
};

/**
 * POST /api/location/cities
 * Fetch cities for a state
 */
const getCities = async (req, res) => {
  try {
    const { country, state } = req.body;

    if (!country || !state) {
      return res.status(400).json({
        success: false,
        message: 'Country and state names are required in request body'
      });
    }

    const cities = await countriesService.getCities(country, state);
    
    res.status(200).json({
      success: true,
      message: `Cities in ${state}, ${country} fetched successfully`,
      country,
      state,
      data: cities,
      count: cities.length
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
      error: error.error || error
    });
  }
};

/**
 * GET /api/location/geocode?city=Delhi&country=India
 * Geocode a city to get latitude and longitude
 */
const geocodeCity = async (req, res) => {
  try {
    const { city, country } = req.query;

    if (!city || !country) {
      return res.status(400).json({
        success: false,
        message: 'City and country query parameters are required'
      });
    }

    const result = await geocodeService.geocodeCity(city, country);
    
    res.status(200).json({
      success: true,
      message: `Geocoding successful for ${city}, ${country}`,
      city,
      country,
      data: result
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
      error: error.error || error
    });
  }
};

/**
 * GET /api/location/nearby-places?lat=28.6139&lng=77.2090&type=restaurant
 * Search for nearby places
 */
const getNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng, type } = req.query;

    if (!lat || !lng || !type) {
      return res.status(400).json({
        success: false,
        message: 'Latitude (lat), longitude (lng), and type query parameters are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude must be valid numbers'
      });
    }

    const places = await geocodeService.getNearbyPlaces(latitude, longitude, type);
    
    res.status(200).json({
      success: true,
      message: `Nearby ${type} places fetched successfully`,
      coordinates: {
        latitude,
        longitude
      },
      searchType: type,
      data: places,
      count: places.length
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
      error: error.error || error
    });
  }
};

module.exports = {
  getCountries,
  getStates,
  getCities,
  geocodeCity,
  getNearbyPlaces
};
