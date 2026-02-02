const NodeCache = require('node-cache');

// Initialize cache with default TTL of 24 hours (86400 seconds)
const cache = new NodeCache({ stdTTL: parseInt(process.env.CACHE_TTL || 86400) });

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {*} Cached value or undefined
 */
const get = (key) => {
  return cache.get(key);
};

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {number} ttl - Time to live in seconds (optional)
 */
const set = (key, value, ttl = null) => {
  if (ttl) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }
};

/**
 * Delete value from cache
 * @param {string} key - Cache key
 */
const del = (key) => {
  cache.del(key);
};

/**
 * Clear all cache
 */
const flush = () => {
  cache.flushAll();
};

module.exports = {
  get,
  set,
  del,
  flush
};
