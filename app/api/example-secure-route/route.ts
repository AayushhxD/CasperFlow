/**
 * Example: Secure API Route
 * Demonstrates best practices for API security
 */

import { NextRequest } from "next/server";
import { secureApiHandler, getRequestBody, errorResponse, successResponse } from "@/lib/api-security";
import { orderSchema, safeValidate } from "@/lib/validation";
import { ValidationError, logError, sanitizeError } from "@/lib/error-handling";

export async function POST(request: NextRequest) {
  return secureApiHandler(
    request,
    async (req) => {
      try {
        // 1. Get request body
        const body = await getRequestBody(req);
        if (!body) {
          throw new ValidationError("Invalid request body");
        }

        // 2. Validate input
        const validation = safeValidate(orderSchema, body);
        if (!validation.success) {
          throw new ValidationError(validation.error);
        }

        const order = validation.data;

        // 3. Process order (your business logic)
        // Example: Save to database, call external API, etc.
        const result = {
          orderId: crypto.randomUUID(),
          type: order.type,
          side: order.side,
          amount: order.amount,
          status: "pending",
          createdAt: new Date().toISOString(),
        };

        // 4. Return success response
        return successResponse(result, 201);
      } catch (error) {
        // Log error securely
        logError(error as Error, {
          path: req.url,
          method: req.method,
        });

        // Return sanitized error
        const sanitized = sanitizeError(error as Error);
        return errorResponse(sanitized.message, sanitized.statusCode);
      }
    },
    {
      allowedMethods: ["POST"],
      requireAuth: false, // Set to true when you implement authentication
      rateLimiter: "trade",
    }
  );
}

export async function GET(request: NextRequest) {
  return secureApiHandler(
    request,
    async (req) => {
      // Example: Get order by ID
      const { searchParams } = new URL(req.url);
      const orderId = searchParams.get("id");

      if (!orderId) {
        throw new ValidationError("Order ID is required");
      }

      // Fetch order from database
      const order = {
        orderId,
        status: "completed",
        // ... other fields
      };

      return successResponse(order);
    },
    {
      allowedMethods: ["GET"],
      rateLimiter: "api",
    }
  );
}
