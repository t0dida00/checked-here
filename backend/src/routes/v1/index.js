const express = require('express');

const healthRoutes = require('./health.routes');
const locationRoutes = require('./location.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/', locationRoutes);

router.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to API v1',
    endpoints: [
      'GET /api/v1/health',
      'GET /api/v1/locations',
      'POST /api/v1/checkin/analyze',
      'POST /api/v1/checkin/image-analyze',
      'POST /api/v1/checkin',
    ],
  });
});

module.exports = router;
