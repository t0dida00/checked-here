function getHealth(_req, res) {
  res.status(200).json({
    success: true,
    message: 'API v1 is healthy',
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  getHealth,
};
