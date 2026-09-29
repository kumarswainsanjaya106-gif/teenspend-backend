import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  }
});

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // 300 requests per 15 minutes for general API
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please slow down.'
  }
});
