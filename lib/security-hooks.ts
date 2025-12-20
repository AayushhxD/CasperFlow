/**
 * Security Hooks for React Components
 */

import { useEffect, useState } from "react";

/**
 * Hook to detect if user is using a secure connection
 */
export function useSecureConnection(): boolean {
  const [isSecure, setIsSecure] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSecure(window.location.protocol === "https:" || window.location.hostname === "localhost");
    }
  }, []);

  return isSecure;
}

/**
 * Hook to warn about insecure connections
 */
export function useSecurityWarning(): void {
  const isSecure = useSecureConnection();

  useEffect(() => {
    if (!isSecure && process.env.NODE_ENV === "production") {
      console.warn("⚠️ WARNING: You are using an insecure connection. Please use HTTPS.");
    }
  }, [isSecure]);
}

/**
 * Hook to implement session timeout
 */
export function useSessionTimeout(timeoutMs: number = 30 * 60 * 1000, onTimeout?: () => void): void {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (onTimeout) {
          onTimeout();
        } else {
          console.log("Session timeout");
          // Redirect to login or show warning
        }
      }, timeoutMs);
    };

    // Reset on user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => {
      document.addEventListener(event, resetTimeout);
    });

    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimeout);
      });
    };
  }, [timeoutMs, onTimeout]);
}

/**
 * Hook for clipboard security
 */
export function useSecureClipboard() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string, sensitive: boolean = false) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      if (sensitive) {
        // Clear clipboard after 30 seconds for sensitive data
        setTimeout(() => {
          navigator.clipboard.writeText("");
        }, 30000);
      }

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return { copyToClipboard, copied };
}

/**
 * Hook to detect devtools (anti-debugging)
 */
export function useDevToolsDetection(onDetected?: () => void): boolean {
  const [devToolsOpen, setDevToolsOpen] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    const threshold = 160;
    let devtools = false;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        if (!devtools) {
          devtools = true;
          setDevToolsOpen(true);
          onDetected?.();
        }
      } else {
        devtools = false;
        setDevToolsOpen(false);
      }
    };

    window.addEventListener("resize", checkDevTools);
    checkDevTools();

    return () => window.removeEventListener("resize", checkDevTools);
  }, [onDetected]);

  return devToolsOpen;
}
