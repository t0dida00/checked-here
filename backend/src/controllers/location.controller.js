const locationService = require('../services/location.service');

async function getLocations(_req, res, next) {
  try {
    const locations = await locationService.getLocations();
    res.status(200).json(locations);
  } catch (error) {
    next(error);
  }
}

async function analyzeCoordinates(req, res, next) {
  try {
    const { coordinate } = req.body || {};
    const analysis = await locationService.analyzeCoordinates(coordinate);

    return res.status(200).json({
      isSuccess: true,
      status: 200,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
}

async function createCheckin(req, res, next) {
  try {
    const { analysis } = req.body || {};
    const location = await locationService.createCheckin(analysis);

    return res.status(200).json({
      isSuccess: true,
      status: 200,
      data: location,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLocations,
  analyzeCoordinates,
  createCheckin,
};
