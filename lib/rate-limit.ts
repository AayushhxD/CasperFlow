/**
 * Rate Limiting Utility
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis with Upstash
 */

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private cache: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.resetTime) {
        this.cache.delete(key);
      }
    }
  }

  check(identifier: string): { success: boolean; limit: number; remaining: number; reset: number } {
    const now = Date.now();
    const entry = this.cache.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Create new entry
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.config.interval,
      };
      this.cache.set(identifier, newEntry);

      return {
        success: true,
        limit: this.config.uniqueTokenPerInterval,
        remaining: this.config.uniqueTokenPerInterval - 1,
        reset: newEntry.resetTime,
      };
    }

    // Increment existing entry
    entry.count++;

    if (entry.count > this.config.uniqueTokenPerInterval) {
      return {
        success: false,
        limit: this.config.uniqueTokenPerInterval,
        remaining: 0,
        reset: entry.resetTime,
      };
    }

    return {
      success: true,
      limit: this.config.uniqueTokenPerInterval,
      remaining: this.config.uniqueTokenPerInterval - entry.count,
      reset: entry.resetTime,
    };
  }
}

// Different rate limiters for different purposes
export const apiLimiter = new RateLimiter({
  interval: 60000, // 1 minute
  uniqueTokenPerInterval: 100, // 100 requests per minute
});

export const tradeLimiter = new RateLimiter({
  interval: 60000, // 1 minute
  uniqueTokenPerInterval: 10, // 10 trades per minute
});

export const authLimiter = new RateLimiter({
  interval: 900000, // 15 minutes
  uniqueTokenPerInterval: 5, // 5 attempts per 15 minutes
});

/**
 * Get identifier from request (IP or user ID)
 */
export function getIdentifier(request: Request): string {
  // Try to get IP from headers
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown";
  
  return ip;
}

/**
 * Rate limit middleware for API routes
 */
export async function rateLimit(
  request: Request,
  limiter: RateLimiter = apiLimiter
): Promise<Response | null> {
  const identifier = getIdentifier(request);
  const result = limiter.check(identifier);

  // Add rate limit headers
  const headers = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.reset).toISOString(),
  };

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
          ...headers,
        },
      }
    );
  }

  // Return headers to be added to successful response
  return null;
}
