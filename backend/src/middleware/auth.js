// Authentication Middleware
// Verifies the web auth token

const authMiddleware = (req, res, next) => {
  const webAuthToken = process.env.WEB_AUTH_TOKEN;

  if (!webAuthToken) {
    console.warn('⚠️  WEB_AUTH_TOKEN not set - authentication disabled');
    return next();
  }

  // Check for token in header or query param
  const token = req.headers['x-web-auth-token'] || 
                req.headers['authorization']?.replace('Bearer ', '') ||
                req.query.token;

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide x-web-auth-token header or token query parameter'
    });
  }

  if (token !== webAuthToken) {
    return res.status(403).json({
      error: 'Invalid token',
      message: 'The provided authentication token is invalid'
    });
  }

  // Token is valid, proceed
  next();
};

module.exports = authMiddleware;
