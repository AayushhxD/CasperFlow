import { z } from "zod";

/**
 * Common validation schemas for the application
 */

// String sanitization
export const sanitizeString = (str: string): string => {
  return str
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .slice(0, 1000); // Limit length
};

// Email validation
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .toLowerCase()
  .transform(sanitizeString);

// Wallet address validation (Ethereum-style)
export const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address")
  .transform((addr) => addr.toLowerCase());

// Amount validation (for trading)
export const amountSchema = z
  .number()
  .positive("Amount must be positive")
  .finite("Amount must be finite")
  .max(1e18, "Amount too large");

// Percentage validation (0-100)
export const percentageSchema = z
  .number()
  .min(0, "Percentage must be at least 0")
  .max(100, "Percentage cannot exceed 100");

// Leverage validation (1-100x)
export const leverageSchema = z
  .number()
  .int("Leverage must be a whole number")
  .min(1, "Leverage must be at least 1x")
  .max(100, "Leverage cannot exceed 100x");

// URL validation
export const urlSchema = z
  .string()
  .url("Invalid URL")
  .refine((url) => {
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }, "URL must use HTTP or HTTPS protocol");

// Transaction hash validation
export const txHashSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash")
  .transform((hash) => hash.toLowerCase());

// Token symbol validation
export const tokenSymbolSchema = z
  .string()
  .min(1, "Token symbol is required")
  .max(10, "Token symbol too long")
  .regex(/^[A-Z0-9]+$/, "Token symbol must be alphanumeric uppercase")
  .transform(sanitizeString);

// Generic pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Trading order validation
export const orderSchema = z.object({
  type: z.enum(["market", "limit"]),
  side: z.enum(["buy", "sell"]),
  amount: amountSchema,
  price: amountSchema.optional(),
  leverage: leverageSchema.optional(),
  stopLoss: amountSchema.optional(),
  takeProfit: amountSchema.optional(),
});

// Position validation
export const positionSchema = z.object({
  symbol: tokenSymbolSchema,
  size: amountSchema,
  leverage: leverageSchema,
  entryPrice: amountSchema,
  currentPrice: amountSchema,
});

/**
 * Sanitize input object by removing undefined and null values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
}

/**
 * Validate and sanitize form data
 */
export function validateFormData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe parse with error handling
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    error: result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
  };
}
