/**
 * Audit Logger
 * Track security-relevant events without exposing sensitive data
 */

type AuditEventType =
  | "auth.login"
  | "auth.logout"
  | "auth.failed"
  | "trade.create"
  | "trade.cancel"
  | "wallet.connect"
  | "wallet.disconnect"
  | "api.error"
  | "security.violation";

interface AuditEvent {
  type: AuditEventType;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  details?: Record<string, any>;
  severity: "low" | "medium" | "high" | "critical";
}

/**
 * Log security audit event
 */
export function auditLog(
  type: AuditEventType,
  details?: Record<string, any>,
  severity: AuditEvent["severity"] = "low"
): void {
  const event: AuditEvent = {
    type,
    timestamp: new Date().toISOString(),
    severity,
    details: sanitizeAuditDetails(details),
  };

  // In production, send to logging service (e.g., Sentry, CloudWatch, etc.)
  if (process.env.NODE_ENV === "production") {
    // Example: Send to external service
    // await fetch('/api/audit', { method: 'POST', body: JSON.stringify(event) });
  }

  // Always log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 Audit Event:", event);
  }

  // Store in memory for recent events (max 100)
  auditStore.add(event);
}

/**
 * Remove sensitive data from audit details
 */
function sanitizeAuditDetails(details?: Record<string, any>): Record<string, any> | undefined {
  if (!details) return undefined;

  const sensitiveKeys = ["password", "token", "secret", "privateKey", "mnemonic", "seed"];
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(details)) {
    if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * In-memory audit event store
 */
class AuditStore {
  private events: AuditEvent[] = [];
  private maxSize = 100;

  add(event: AuditEvent): void {
    this.events.push(event);
    if (this.events.length > this.maxSize) {
      this.events.shift();
    }
  }

  getRecent(count: number = 10): AuditEvent[] {
    return this.events.slice(-count);
  }

  getBySeverity(severity: AuditEvent["severity"]): AuditEvent[] {
    return this.events.filter((e) => e.severity === severity);
  }

  clear(): void {
    this.events = [];
  }
}

export const auditStore = new AuditStore();

/**
 * Helper functions for common audit events
 */
export const audit = {
  loginSuccess: (userId: string) => auditLog("auth.login", { userId }, "low"),
  loginFailed: (attempt: string) => auditLog("auth.failed", { attempt }, "medium"),
  logout: (userId: string) => auditLog("auth.logout", { userId }, "low"),
  tradeCreated: (tradeId: string, amount: number) => auditLog("trade.create", { tradeId, amount }, "medium"),
  tradeCancelled: (tradeId: string) => auditLog("trade.cancel", { tradeId }, "low"),
  walletConnected: (address: string) => auditLog("wallet.connect", { address }, "low"),
  walletDisconnected: () => auditLog("wallet.disconnect", {}, "low"),
  securityViolation: (reason: string) => auditLog("security.violation", { reason }, "critical"),
};
