const axios = require('axios');
const cache = require('../cache/cache');

const BASE_URL = process.env.COUNTRIES_NOW_BASE_URL || 'https://countriesnow.space/api/v0.1';

/**
 * Fetch all countries
 * @returns {Promise<Array>} Array of countries
 */
const getCountries = async () => {
  const cacheKey = 'countries:all';
  
  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await axios.get(`${BASE_URL}/countries/positions`);
    
    if (response.data && response.data.data) {
      const countries = response.data.data.map(item => ({
        name: item.name,
        iso2: item.iso2,
        iso3: item.iso3
      }));
      
      // Cache for 24 hours
      cache.set(cacheKey, countries, 86400);
      return countries;
    }
    
    throw new Error('Invalid response from countries API');
  } catch (error) {
    throw {
      status: 500,
      message: 'Failed to fetch countries',
      error: error.message
    };
  }
};

/**
 * Fetch states for a country
 * @param {string} country - Country name
 * @returns {Promise<Array>} Array of states
 */
const getStates = async (country) => {
  if (!country) {
    throw {
      status: 400,
      message: 'Country name is required'
    };
  }

  const cacheKey = `states:${country}`;
  
  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await axios.post(`${BASE_URL}/countries/states`, {
      country: country
    });
    
    if (response.data && response.data.data) {
      const states = response.data.data.map(item => ({
        name: item.name
      }));
      
      // Cache per country for 24 hours
      cache.set(cacheKey, states, 86400);
      return states;
    }
    
    throw new Error('Invalid response from states API');
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      message: `Failed to fetch states for ${country}`,
      error: error.message
    };
  }
};

/**
 * Fetch cities for a state
 * @param {string} country - Country name
 * @param {string} state - State name
 * @returns {Promise<Array>} Array of cities
 */
const getCities = async (country, state) => {
  if (!country || !state) {
    throw {
      status: 400,
      message: 'Country and state names are required'
    };
  }

  const cacheKey = `cities:${country}:${state}`;
  
  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await axios.post(`${BASE_URL}/countries/state/cities`, {
      country: country,
      state: state
    });
    
    if (response.data && response.data.data) {
      const cities = response.data.data.map(item => ({
        name: item
      }));
      
      // Cache per state for 24 hours
      cache.set(cacheKey, cities, 86400);
      return cities;
    }
    
    throw new Error('Invalid response from cities API');
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      message: `Failed to fetch cities for ${state}, ${country}`,
      error: error.message
    };
  }
};

module.exports = {
  getCountries,
  getStates,
  getCities
};
