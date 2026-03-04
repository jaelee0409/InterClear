import rateLimit from 'express-rate-limit';

/**
 * Per-IP rate limiter for the analyze endpoint.
 * Prevents abuse regardless of auth status.
 * Free-tier daily limits are enforced separately by enforceDailyLimit.
 */
export const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // 10 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});
