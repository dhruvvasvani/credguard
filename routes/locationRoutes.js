const express = require('express');
const router = express.Router();
const { getCountries, getStates, getCities } = require('../controllers/locationController');

// GET all countries
router.get('/countries', getCountries);

// GET states of a specific country (by ISO2 code)
router.get('/states/:countryCode', getStates);

// GET cities of a specific state (by stateCode)
router.get('/cities/:stateCode', getCities);

module.exports = router;
