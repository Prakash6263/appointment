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
    
    console.log('[v0] Countries API response:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.data) {
      let countries = [];
      
      // Handle different response formats
      if (Array.isArray(response.data.data)) {
        // If data is an array of objects with 'name' property
        if (response.data.data.length > 0 && typeof response.data.data[0] === 'object' && response.data.data[0].name) {
          countries = response.data.data.map(c => c.name).sort();
        } 
        // If data is an array of strings
        else if (typeof response.data.data[0] === 'string') {
          countries = response.data.data.sort();
        }
      }
      
      if (countries.length > 0) {
        cache.set(cacheKey, countries);
        return countries;
      }
    }
    
    throw new Error('Invalid response from Countries API - no data found');
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
    
    console.log('[v0] States API response:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.data) {
      let states = [];
      
      // Handle different response formats
      if (Array.isArray(response.data.data)) {
        // If data is an array of objects with 'name' property
        if (response.data.data.length > 0 && typeof response.data.data[0] === 'object' && response.data.data[0].name) {
          states = response.data.data.map(s => s.name).sort();
        } 
        // If data is an array of strings
        else if (typeof response.data.data[0] === 'string') {
          states = response.data.data.sort();
        }
      } 
      // If data is an object with country states
      else if (typeof response.data.data === 'object') {
        states = Object.values(response.data.data).sort();
      }
      
      if (states.length > 0) {
        cache.set(cacheKey, states);
        return states;
      }
    }
    
    throw new Error('Invalid response from States API - no data found');
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
    
    console.log('[v0] Cities API response:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.data) {
      let cities = [];
      
      // Handle different response formats
      if (Array.isArray(response.data.data)) {
        cities = response.data.data.sort();
      } 
      // If data is an object with city names
      else if (typeof response.data.data === 'object') {
        cities = Object.values(response.data.data).sort();
      }
      
      if (cities.length > 0) {
        cache.set(cacheKey, cities);
        return cities;
      }
    }
    
    throw new Error('Invalid response from Cities API - no data found');
  } catch (error) {
    console.error(`Error fetching cities for ${country}, ${state}:`, error.message);
    throw error;
  }
};
