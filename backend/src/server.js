#!/usr/bin/env node
/**
 * Vie Web Backend Server
 * Proxies frontend requests to OpenClaw gateway
 * Security: Gateway stays on localhost, only this backend talks to it
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Services
const OpenClawService = require('./services/openclaw');

// Middleware
const authMiddleware = require('./middleware/auth');
const createRateLimiter = require('./middleware/rateLimit');

// Routes
const healthRoutes = require('./routes/health');
const chatRoutes = require('./routes/chat');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenClaw service
const openclawService = new OpenClawService({
  gatewayUrl: process.env.OPENCLAW_GATEWAY_URL,
  gatewayToken: process.env.OPENCLAW_GATEWAY_TOKEN
});

// Store service in app context for routes to access
app.set('openclawService', openclawService);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS === '*' ? '*' : process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
};

// Middleware stack
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting (apply to all routes)
app.use(createRateLimiter());

// Health check routes (no auth required)
app.use('/health', healthRoutes);

// API routes (auth required)
app.use('/api/chat', authMiddleware, chatRoutes);

// Serve frontend static files (will add in Phase 2)
app.use(express.static(path.join(__dirname, '../../frontend/public')));

// Fallback route for SPA (serve index.html for any unmatched route)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../../frontend/public/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({
        error: 'Not found',
        message: 'Frontend not yet deployed. API endpoints are available at /api/*'
      });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, async () => {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                    Vie Web Backend                       ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 External access: http://<vm-ip>:${PORT}`);
  console.log('');
  console.log('Endpoints:');
  console.log(`  GET  /health              - Health check`);
  console.log(`  GET  /health/gateway      - Gateway connection status`);
  console.log(`  POST /api/chat/send       - Send message to Clawd`);
  console.log(`  POST /api/chat/stream     - Stream message (SSE)`);
  console.log('');

  // Test gateway connection on startup
  console.log('Testing OpenClaw gateway connection...');
  const connected = await openclawService.testConnection();
  
  if (connected) {
    console.log('✅ Gateway connection successful!');
  } else {
    console.log('⚠️  Gateway connection failed - check configuration');
    console.log(`   Gateway URL: ${process.env.OPENCLAW_GATEWAY_URL}`);
  }
  
  console.log('');
  console.log('Ready for requests! 💜');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
