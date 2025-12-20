import { z } from "zod";

/**
 * Environment variable validation schema
 * Validates all environment variables at build time
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  // Next.js
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  // Database (if applicable)
  DATABASE_URL: z.string().url().optional(),
  
  // API Keys (add your specific keys)
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  
  // Wallet/Web3 (if applicable)
  NEXT_PUBLIC_CHAIN_ID: z.string().optional(),
  NEXT_PUBLIC_RPC_URL: z.string().url().optional(),
  
  // Security
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Rate limiting
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

/**
 * Client-safe environment variables
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_CHAIN_ID: z.string().optional(),
  NEXT_PUBLIC_RPC_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validates environment variables
 * @throws {Error} If validation fails
 */
export function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

/**
 * Get client-safe environment variables
 */
export function getClientEnv(): ClientEnv {
  return {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
  };
}

// Validate on module load in production
if (process.env.NODE_ENV === "production") {
  validateEnv();
}

export const env = process.env as Env;
