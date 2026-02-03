// Rate Limiting Middleware
// Prevents abuse by limiting requests per time window

const rateLimit = require('express-rate-limit');

const createRateLimiter = () => {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000; // 1 minute
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

  return rateLimit({
    windowMs: windowMs,
    max: maxRequests,
    message: {
      error: 'Too many requests',
      message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds.`
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false   // Disable `X-RateLimit-*` headers
  });
};

module.exports = createRateLimiter;
