import rateLimit from 'express-rate-limit';

// High-frequency endpoints (market data, quotes) need generous limits
export const marketLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 600, // 10 req/sec sustained
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
});

// General API limit — generous for trading terminal polling
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
});

// Auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts' } },
});
