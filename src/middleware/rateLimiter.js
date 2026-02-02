const rateLimit = require('express-rate-limit');

/**
 * Global rate limiter for all API routes
 */
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false // Disable `X-RateLimit-*` headers
});

/**
 * Strict rate limiter for location APIs
 */
const locationLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000), // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many location requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Auth rate limiter for partner endpoints
 */
const authLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 5, // limit each IP to 5 requests per minute
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  globalLimiter,
  locationLimiter,
  authLimiter
};
