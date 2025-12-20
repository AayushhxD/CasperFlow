/**
 * Security Constants
 * Centralized configuration for security settings
 */

export const SECURITY_CONFIG = {
  // Rate Limiting
  RATE_LIMIT: {
    API: {
      WINDOW_MS: 60000, // 1 minute
      MAX_REQUESTS: 100,
    },
    TRADE: {
      WINDOW_MS: 60000, // 1 minute
      MAX_REQUESTS: 10,
    },
    AUTH: {
      WINDOW_MS: 900000, // 15 minutes
      MAX_REQUESTS: 5,
    },
  },

  // Session
  SESSION: {
    TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
    ABSOLUTE_TIMEOUT_MS: 12 * 60 * 60 * 1000, // 12 hours
  },

  // Password Requirements
  PASSWORD: {
    MIN_LENGTH: 12,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL: true,
  },

  // File Upload
  UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },

  // CORS
  CORS: {
    ALLOWED_ORIGINS:
      process.env.NODE_ENV === "production"
        ? [process.env.NEXT_PUBLIC_APP_URL].filter(Boolean)
        : ["http://localhost:3000", "http://localhost:3001"],
    ALLOWED_METHODS: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    ALLOWED_HEADERS: ["Content-Type", "Authorization"],
    CREDENTIALS: true,
    MAX_AGE: 86400, // 24 hours
  },

  // Token
  TOKEN: {
    ACCESS_TOKEN_EXPIRY: 15 * 60, // 15 minutes
    REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60, // 7 days
  },

  // Validation
  VALIDATION: {
    MAX_STRING_LENGTH: 1000,
    MAX_ARRAY_LENGTH: 100,
    MAX_OBJECT_DEPTH: 5,
  },

  // Web3
  WEB3: {
    MAX_TRANSACTION_VALUE: "1000000000000000000000", // 1000 ETH in wei
    MIN_GAS_LIMIT: "21000",
    MAX_GAS_LIMIT: "10000000",
  },

  // Audit
  AUDIT: {
    RETAIN_EVENTS: 100,
    LOG_LEVELS: ["low", "medium", "high", "critical"] as const,
  },
} as const;

/**
 * Security feature flags
 */
export const SECURITY_FEATURES = {
  ENABLE_RATE_LIMITING: true,
  ENABLE_CSRF_PROTECTION: true,
  ENABLE_AUDIT_LOGGING: true,
  ENABLE_SESSION_TIMEOUT: true,
  ENABLE_DEVTOOLS_DETECTION: process.env.NODE_ENV === "production",
  ENABLE_CLIPBOARD_SECURITY: true,
  ENABLE_XSS_PROTECTION: true,
  ENABLE_SQL_INJECTION_PROTECTION: true,
} as const;

/**
 * Blocked patterns for security
 */
export const BLOCKED_PATTERNS = {
  XSS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
  ],
  SQL_INJECTION: [
    /(\s|^)(union|select|insert|update|delete|drop|create|alter|exec|execute)(\s|$)/gi,
    /--/g,
    /;/g,
  ],
  PATH_TRAVERSAL: [
    /\.\.\//g,
    /\.\.\\\/g,
  ],
} as const;

/**
 * Sensitive field names to redact in logs
 */
export const SENSITIVE_FIELDS = [
  "password",
  "token",
  "secret",
  "key",
  "authorization",
  "cookie",
  "session",
  "privateKey",
  "mnemonic",
  "seed",
  "pin",
  "ssn",
  "creditCard",
  "cvv",
] as const;

/**
 * Security headers
 */
export const SECURITY_HEADER_VALUES = {
  HSTS: "max-age=63072000; includeSubDomains; preload",
  FRAME_OPTIONS: "SAMEORIGIN",
  CONTENT_TYPE_OPTIONS: "nosniff",
  XSS_PROTECTION: "1; mode=block",
  REFERRER_POLICY: "strict-origin-when-cross-origin",
  PERMISSIONS_POLICY: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
} as const;
