/**
 * Secure Error Handling Utilities
 * Prevents leaking sensitive information in error messages
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "AUTH_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429, "RATE_LIMIT_ERROR");
  }
}

/**
 * Sanitize error for client response
 * Removes stack traces and sensitive info in production
 */
export function sanitizeError(error: Error | AppError): {
  message: string;
  code?: string;
  statusCode: number;
  stack?: string;
} {
  const isDev = process.env.NODE_ENV === "development";
  
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      ...(isDev && { stack: error.stack }),
    };
  }

  // Don't expose internal errors in production
  return {
    message: isDev ? error.message : "An unexpected error occurred",
    statusCode: 500,
    ...(isDev && { stack: error.stack }),
  };
}

/**
 * Log error securely (without sensitive data)
 */
export function logError(error: Error, context?: Record<string, any>): void {
  const sanitizedContext = context ? sanitizeLogContext(context) : {};
  
  console.error("Error occurred:", {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...sanitizedContext,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Remove sensitive fields from log context
 */
function sanitizeLogContext(context: Record<string, any>): Record<string, any> {
  const sensitiveKeys = ["password", "token", "secret", "key", "authorization", "cookie"];
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
