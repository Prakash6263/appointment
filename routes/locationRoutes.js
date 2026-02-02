const express = require('express');
const locationController = require('../controllers/locationController');
const { locationLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply rate limiting to all location routes
router.use(locationLimiter);

// Get all countries
router.get('/countries', locationController.getCountries);

// Get states for a country
router.post('/states', locationController.getStates);

// Get cities for a country and state
router.post('/cities', locationController.getCities);

// Geocode location (get coordinates from city/country)
router.get('/geocode', locationController.geocodeLocation);

// Find nearby places by type, latitude, longitude
router.get('/nearby-places', locationController.findNearbyPlaces);

// Reverse geocode (get address from coordinates)
router.get('/reverse-geocode', locationController.reverseGeocode);

module.exports = router;
