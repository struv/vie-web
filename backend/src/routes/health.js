// Health Check Routes

const express = require('express');
const router = express.Router();

/**
 * GET /health
 * Simple health check endpoint
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'vie-web-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * GET /health/gateway
 * Check OpenClaw gateway connection status
 */
router.get('/gateway', async (req, res) => {
  try {
    const openclawService = req.app.get('openclawService');
    const connected = await openclawService.testConnection();

    res.json({
      status: connected ? 'ok' : 'error',
      gateway: {
        connected: connected,
        url: process.env.OPENCLAW_GATEWAY_URL
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
