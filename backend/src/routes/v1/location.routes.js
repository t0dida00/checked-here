const express = require('express');

const {
  getLocations,
  analyzeCoordinates,
  createCheckin,
} = require('../../controllers/location.controller');

const router = express.Router();

router.get('/locations', getLocations);
router.post('/checkin/analyze', analyzeCoordinates);
router.post('/checkin', createCheckin);

module.exports = router;
