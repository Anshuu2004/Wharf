import rateLimit from 'express-rate-limit';

// General Rate Limiter For Repo Analysis
// Limit: 20 Requests per 15 Minutes per IP
export const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: 'Too many analysis requests. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict Rate Limiter For AI Generation
// Limit: 5 Generations per 30 Minutes per IP
export const generationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    error: 'Generation limit reached. Please wait 60 minutes before generating more docs.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const anonymousAnalysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  skip: (req: any) => !!req.user,
  message: {
    success: false,
    error: 'Anonymous analysis limit reached. Please log in with GitHub for unlimited access.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
