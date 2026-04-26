import rateLimit from 'express-rate-limit';

// General Rate Limiter For Repo Analysis
// Limit: 20 Requests per 15 Minutes per IP
export const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20,
  message: {
    success: false,
    error: 'Too many analysis requests. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict Rate Limiter For AI Generation
// Limit: 5 Generations per 30 Minutes per IP.
export const generationLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, 
  max: 5,
  message: {
    success: false,
    error: 'Generation limit reached. Please wait 30 minutes before generating more docs.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
