import rateLimit from 'express-rate-limit'
import { Request, Response } from 'express'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
interface RateLimitOptions {
  windowMs?: number
  maxRequests?: number
  message?: string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

// ============================================================================
// GENERAL RATE LIMITER
// ============================================================================
export const createRateLimiter = (options: RateLimitOptions = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 60 * 1000, // Default: 1 minute
    max: options.maxRequests || 100, // Default: 100 requests
    message: {
      error: {
        message: options.message || 'Too many requests, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        status: 429,
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skipFailedRequests: options.skipFailedRequests || false,
    keyGenerator: (req: Request): string => {
      // Use user ID if authenticated, otherwise use IP
      return (req as any).user?.userId || req.ip || 'unknown'
    },
  })
}

// ============================================================================
// PRE-CONFIGURED RATE LIMITERS
// ============================================================================

// Strict rate limiter for sensitive endpoints (auth, password reset)
export const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many attempts, please try again later',
})

// Medium rate limiter for API endpoints
export const mediumRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 50,
  message: 'Too many requests, please slow down',
})

// Relaxed rate limiter for read-only endpoints
export const relaxedRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 200,
})

// Auth-specific rate limiter
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: {
    error: {
      message: 'Too many login attempts, please try again later',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      status: 429,
    },
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
})

// Password reset rate limiter
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: {
    error: {
      message: 'Too many password reset attempts, please try again later',
      code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
      status: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// File upload rate limiter
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: {
    error: {
      message: 'Upload limit exceeded, please try again later',
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      status: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// API key rate limiter (for external API integrations)
export const apiKeyRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // Higher limit for API keys
  keyGenerator: (req: Request): string => {
    // Use API key from header if present
    const apiKey = req.headers['x-api-key'] as string
    return apiKey || req.ip || 'unknown'
  },
  message: {
    error: {
      message: 'API rate limit exceeded',
      code: 'API_KEY_RATE_LIMIT_EXCEEDED',
      status: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// ============================================================================
// CUSTOM RATE LIMITER WITH DYNAMIC LIMITS
// ============================================================================
export const createRoleBasedRateLimiter = () => {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: (req: Request): number => {
      // Different limits based on user role
      const user = (req as any).user
      if (!user) return 50 // Default for unauthenticated

      switch (user.role) {
        case 'ADMIN':
          return 500
        case 'MANAGER':
          return 200
        case 'ENGINEER':
        case 'ACCOUNTANT':
        case 'HR':
          return 100
        default:
          return 50
      }
    },
    keyGenerator: (req: Request): string => {
      return (req as any).user?.userId || req.ip || 'unknown'
    },
    message: {
      error: {
        message: 'Rate limit exceeded for your account',
        code: 'ROLE_BASED_RATE_LIMIT_EXCEEDED',
        status: 429,
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
}
