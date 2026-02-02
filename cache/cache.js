const NodeCache = require('node-cache');

// Initialize cache with 24 hour standard TTL
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

module.exports = cache;
