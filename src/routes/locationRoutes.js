const express = require('express');
const locationController = require('../controllers/locationController');
const { locationLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * Apply rate limiting to all location routes
 */
router.use(locationLimiter);

/**
 * GET /api/location/countries
 * Fetch all countries
 */
router.get('/countries', locationController.getCountries);

/**
 * POST /api/location/states
 * Fetch states for a country
 * Body: { "country": "India" }
 */
router.post('/states', locationController.getStates);

/**
 * POST /api/location/cities
 * Fetch cities for a state
 * Body: { "country": "India", "state": "Delhi" }
 */
router.post('/cities', locationController.getCities);

/**
 * GET /api/location/geocode
 * Geocode a city to get latitude and longitude
 * Query params: ?city=Delhi&country=India
 */
router.get('/geocode', locationController.geocodeCity);

/**
 * GET /api/location/nearby-places
 * Search for nearby places
 * Query params: ?lat=28.6139&lng=77.2090&type=restaurant
 */
router.get('/nearby-places', locationController.getNearbyPlaces);

module.exports = router;
