/**
 * XSS (Cross-Site Scripting) Protection Utilities
 */

/**
 * Escape HTML to prevent XSS attacks
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitize user input for display
 */
export function sanitizeForDisplay(input: string): string {
  // Remove any script tags
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "");
  
  return escapeHtml(sanitized);
}

/**
 * Validate URL to prevent XSS via href
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:", "mailto:"].includes(parsed.protocol);
  } catch {
    // Relative URLs are okay
    return url.startsWith("/") && !url.startsWith("//");
  }
}

/**
 * SQL Injection Prevention (for reference, use ORMs in practice)
 */
export function escapeSQL(input: string): string {
  return input.replace(/['";\\]/g, "\\$&");
}
