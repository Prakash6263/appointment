const axios = require('axios');
const cache = require('../cache/cache');

const COUNTRIES_API_BASE = 'https://countriesnow.space/api/v0.1';

// Get all countries
exports.getCountries = async () => {
  try {
    const cacheKey = 'all_countries';
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const response = await axios.get(`${COUNTRIES_API_BASE}/countries/positions`);
    
    if (response.data && response.data.data) {
      const countries = response.data.data.map(c => c.name).sort();
      cache.set(cacheKey, countries);
      return countries;
    }
    
    throw new Error('Invalid response from Countries API');
  } catch (error) {
    console.error('Error fetching countries:', error.message);
    throw error;
  }
};

// Get states by country
exports.getStates = async (country) => {
  try {
    if (!country || typeof country !== 'string') {
      throw new Error('Country name is required');
    }

    const cacheKey = `states_${country.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const response = await axios.post(`${COUNTRIES_API_BASE}/countries/states`, {
      country: country.trim(),
    });
    
    if (response.data && response.data.data) {
      const states = response.data.data.map(s => s.name).sort();
      cache.set(cacheKey, states);
      return states;
    }
    
    throw new Error('Invalid response from States API');
  } catch (error) {
    console.error(`Error fetching states for ${country}:`, error.message);
    throw error;
  }
};

// Get cities by country and state
exports.getCities = async (country, state) => {
  try {
    if (!country || !state || typeof country !== 'string' || typeof state !== 'string') {
      throw new Error('Country and State names are required');
    }

    const cacheKey = `cities_${country.toLowerCase()}_${state.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const response = await axios.post(`${COUNTRIES_API_BASE}/countries/state/cities`, {
      country: country.trim(),
      state: state.trim(),
    });
    
    if (response.data && response.data.data) {
      const cities = response.data.data.sort();
      cache.set(cacheKey, cities);
      return cities;
    }
    
    throw new Error('Invalid response from Cities API');
  } catch (error) {
    console.error(`Error fetching cities for ${country}, ${state}:`, error.message);
    throw error;
  }
};
