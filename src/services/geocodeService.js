const axios = require('axios');
const cache = require('../cache/cache');

const BASE_URL = process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org';

/**
 * Geocode a city to get latitude and longitude
 * @param {string} city - City name
 * @param {string} country - Country name
 * @returns {Promise<Object>} Object containing latitude, longitude, and place details
 */
const geocodeCity = async (city, country) => {
  if (!city || !country) {
    throw {
      status: 400,
      message: 'City and country parameters are required'
    };
  }

  const cacheKey = `geocode:${city}:${country}`;
  
  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const query = `${city},${country}`;
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        q: query,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'LocationServiceBackend/1.0'
      }
    });
    
    if (response.data && response.data.length > 0) {
      const place = response.data[0];
      const result = {
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
        displayName: place.display_name,
        placeId: place.place_id,
        type: place.type
      };
      
      // Cache for 24 hours
      cache.set(cacheKey, result, 86400);
      return result;
    }
    
    throw {
      status: 404,
      message: `Location not found for ${city}, ${country}`
    };
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw {
      status: 500,
      message: 'Failed to geocode location',
      error: error.message
    };
  }
};

/**
 * Search for nearby places
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} type - Type of place (e.g., restaurant, hotel, hospital)
 * @returns {Promise<Array>} Array of nearby places
 */
const getNearbyPlaces = async (lat, lng, type) => {
  if (!lat || !lng || !type) {
    throw {
      status: 400,
      message: 'Latitude, longitude, and type parameters are required'
    };
  }

  const cacheKey = `nearby:${lat}:${lng}:${type}`;
  
  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const query = `${type} near ${lat},${lng}`;
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        q: query,
        format: 'json',
        limit: 20
      },
      headers: {
        'User-Agent': 'LocationServiceBackend/1.0'
      }
    });
    
    if (response.data && Array.isArray(response.data)) {
      const places = response.data.map(place => ({
        name: place.display_name,
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
        placeId: place.place_id,
        type: place.type,
        address: place.address
      }));
      
      // Cache for 6 hours (shorter TTL for location-based searches)
      cache.set(cacheKey, places, 21600);
      return places;
    }
    
    return [];
  } catch (error) {
    throw {
      status: 500,
      message: 'Failed to fetch nearby places',
      error: error.message
    };
  }
};

module.exports = {
  geocodeCity,
  getNearbyPlaces
};
