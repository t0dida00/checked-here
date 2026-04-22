const express = require('express');

const {
  getLocations,
  analyzeCoordinates,
  analyzeSightImage,
  createCheckin,
} = require('../../controllers/location.controller');

const router = express.Router();

router.get('/locations', getLocations);
router.post('/checkin/analyze', analyzeCoordinates);
router.post('/checkin/image-analyze', analyzeSightImage);
router.post('/checkin', createCheckin);

module.exports = router;
