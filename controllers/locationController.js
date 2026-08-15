const { Country, State, City } = require('country-state-city');

// Get all countries
const getCountries = (req, res) => {
  try {
    const countries = Country.getAllCountries();
    res.json(countries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
};

// Get states for a given country (ISO2 code)
const getStates = (req, res) => {
  try {
    const { countryCode } = req.params;
    const states = State.getStatesOfCountry(countryCode);
    res.json(states);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch states' });
  }
};

// Get cities for a given state (ISO2 code)
const getCities = (req, res) => {
  try {
    const { stateCode } = req.params;
    const cities = City.getCitiesOfState(stateCode);
    res.json(cities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
};

module.exports = {
  getCountries,
  getStates,
  getCities,
};
