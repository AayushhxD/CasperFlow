/**
 * API Security Utilities
 * Helper functions for securing API routes
 */

import { NextRequest } from "next/server";
import { rateLimit, apiLimiter, tradeLimiter, authLimiter } from "./rate-limit";

/**
 * Verify request method
 */
export function verifyMethod(request: NextRequest, allowedMethods: string[]): boolean {
  return allowedMethods.includes(request.method);
}

/**
 * Get request body safely
 */
export async function getRequestBody<T>(request: NextRequest): Promise<T | null> {
  try {
    const contentType = request.headers.get("content-type");
    
    if (!contentType?.includes("application/json")) {
      return null;
    }
    
    const body = await request.json();
    return body as T;
  } catch {
    return null;
  }
}

/**
 * Create error response
 */
export function errorResponse(message: string, status: number = 400) {
  return Response.json(
    {
      error: true,
      message,
    },
    { status }
  );
}

/**
 * Create success response
 */
export function successResponse<T>(data: T, status: number = 200) {
  return Response.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * API Route handler with security
 */
export async function secureApiHandler(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<Response>,
  options: {
    allowedMethods?: string[];
    requireAuth?: boolean;
    rateLimiter?: "api" | "trade" | "auth";
  } = {}
): Promise<Response> {
  const {
    allowedMethods = ["GET", "POST"],
    requireAuth = false,
    rateLimiter = "api",
  } = options;

  try {
    // Verify HTTP method
    if (!verifyMethod(request, allowedMethods)) {
      return errorResponse(`Method ${request.method} not allowed`, 405);
    }

    // Apply rate limiting
    const limiter = rateLimiter === "trade" ? tradeLimiter : rateLimiter === "auth" ? authLimiter : apiLimiter;
    const rateLimitResult = await rateLimit(request, limiter);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Authentication check (implement based on your auth strategy)
    if (requireAuth) {
      const authHeader = request.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return errorResponse("Unauthorized", 401);
      }
      
      // TODO: Verify JWT token or session
      // const token = authHeader.substring(7);
      // const isValid = await verifyToken(token);
      // if (!isValid) {
      //   return errorResponse("Invalid token", 401);
      // }
    }

    // Call the actual handler
    return await handler(request);
  } catch (error) {
    console.error("API Error:", error);
    return errorResponse(
      process.env.NODE_ENV === "development" 
        ? (error as Error).message 
        : "Internal server error",
      500
    );
  }
}

/**
 * CSRF Token validation (for forms)
 */
export function validateCSRFToken(token: string | null, storedToken: string | null): boolean {
  if (!token || !storedToken) return false;
  return token === storedToken;
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Sanitize file upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ["image/jpeg", "image/png", "image/webp"] } = options;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed`,
    };
  }

  return { valid: true };
}
