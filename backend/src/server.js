#!/usr/bin/env node
/**
 * Vie Web Backend Server
 * Proxies frontend requests to OpenClaw gateway
 * Security: Gateway stays on localhost, only this backend talks to it
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');

// Services
const OpenClawService = require('./services/openclaw');

// Middleware
const authMiddleware = require('./middleware/auth');
const createRateLimiter = require('./middleware/rateLimit');

// Routes
const healthRoutes = require('./routes/health');
const chatRoutes = require('./routes/chat');
const ttsRoutes = require('./routes/tts');

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

// OPTIMIZED: Enable gzip/brotli compression for all responses
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 // Balance between speed and compression ratio
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting (apply to all routes)
app.use(createRateLimiter());

// Health check routes (no auth required)
app.use('/health', healthRoutes);

// API routes (auth required)
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api/tts', authMiddleware, ttsRoutes);

// OPTIMIZED: Serve frontend static files with aggressive caching
app.use(express.static(path.join(__dirname, '../../frontend/public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0', // 1 year cache in production
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Cache JS/CSS aggressively, HTML not at all
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (filePath.match(/\.(js|css)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filePath.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
    }
  }
}));

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
  console.log(`  GET  /api/tts/voices      - List available TTS voices`);
  console.log(`  POST /api/tts/elevenlabs  - Generate speech with ElevenLabs`);
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
