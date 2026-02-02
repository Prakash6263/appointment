const axios = require('axios');
const cache = require('../cache/cache');

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

const nominatimClient = axios.create({
  baseURL: NOMINATIM_BASE,
  headers: {
    'User-Agent': 'AppointmentBookingAPI/1.0 (Location Service)',
  },
  timeout: 10000,
});

// Geocode city and country to get coordinates
exports.geocodeLocation = async (city, country) => {
  try {
    if (!city || !country) {
      throw new Error('City and country are required');
    }

    const cacheKey = `geocode_${city.toLowerCase()}_${country.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const query = `${city}, ${country}`;
    const response = await nominatimClient.get('/search', {
      params: {
        q: query,
        format: 'json',
        limit: 1,
      },
    });

    if (!response.data || response.data.length === 0) {
      throw new Error(`Location not found: ${query}`);
    }

    const result = {
      latitude: parseFloat(response.data[0].lat),
      longitude: parseFloat(response.data[0].lon),
      displayName: response.data[0].display_name,
      boundingbox: response.data[0].boundingbox,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Error geocoding ${city}, ${country}:`, error.message);
    throw error;
  }
};

// Find nearby places by type, latitude, and longitude
exports.findNearbyPlaces = async (latitude, longitude, placeType = 'restaurant') => {
  try {
    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Invalid coordinates');
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error('Coordinates out of range');
    }

    const cacheKey = `nearby_${placeType}_${lat}_${lng}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const query = `${placeType} near ${lat},${lng}`;
    const response = await nominatimClient.get('/search', {
      params: {
        q: query,
        format: 'json',
        limit: 10,
      },
    });

    if (!response.data || response.data.length === 0) {
      return {
        placeType,
        latitude: lat,
        longitude: lng,
        results: [],
        message: `No ${placeType}s found near coordinates`,
      };
    }

    const results = response.data.map(place => ({
      name: place.name,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
      displayName: place.display_name,
      type: place.type,
    }));

    const result = {
      placeType,
      latitude: lat,
      longitude: lng,
      results,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Error finding nearby places:`, error.message);
    throw error;
  }
};

// Reverse geocode (get address from coordinates)
exports.reverseGeocode = async (latitude, longitude) => {
  try {
    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Invalid coordinates');
    }

    const cacheKey = `reverse_geocode_${lat}_${lng}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const response = await nominatimClient.get('/reverse', {
      params: {
        lat: lat,
        lon: lng,
        format: 'json',
      },
    });

    if (!response.data) {
      throw new Error('Location not found');
    }

    const result = {
      latitude: lat,
      longitude: lng,
      address: response.data.address,
      displayName: response.data.display_name,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Error reverse geocoding:`, error.message);
    throw error;
  }
};
