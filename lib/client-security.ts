/**
 * Client-side Security Utilities
 */

/**
 * Detect if running in secure context
 */
export function isSecureContext(): boolean {
  if (typeof window === "undefined") return true;
  return window.isSecureContext;
}

/**
 * Prevent right-click (optional - use sparingly)
 */
export function disableContextMenu(): void {
  if (typeof window === "undefined") return;
  
  document.addEventListener("contextmenu", (e) => {
    if (process.env.NODE_ENV === "production") {
      e.preventDefault();
    }
  });
}

/**
 * Prevent text selection (optional - use sparingly)
 */
export function disableTextSelection(): void {
  if (typeof window === "undefined") return;
  
  document.body.style.userSelect = "none";
  document.body.style.webkitUserSelect = "none";
}

/**
 * Clear sensitive data on page unload
 */
export function clearSensitiveDataOnUnload(clearFn: () => void): void {
  if (typeof window === "undefined") return;

  const handleUnload = () => {
    clearFn();
    // Clear session/local storage if needed
    // sessionStorage.clear();
  };

  window.addEventListener("beforeunload", handleUnload);
  window.addEventListener("pagehide", handleUnload);
}

/**
 * Detect screenshot attempts (limited effectiveness)
 */
export function detectScreenshot(onDetect: () => void): void {
  if (typeof window === "undefined") return;

  // Detect Print Screen key
  document.addEventListener("keyup", (e) => {
    if (e.key === "PrintScreen") {
      onDetect();
    }
  });

  // Detect browser screenshot extensions (limited)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // Potentially a screenshot
    }
  });
}

/**
 * Secure local storage wrapper
 */
export const secureStorage = {
  setItem: (key: string, value: string, encrypt: boolean = false): void => {
    try {
      const data = encrypt ? btoa(value) : value;
      localStorage.setItem(key, data);
    } catch (error) {
      console.error("Failed to save to storage:", error);
    }
  },

  getItem: (key: string, decrypt: boolean = false): string | null => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      return decrypt ? atob(data) : data;
    } catch (error) {
      console.error("Failed to read from storage:", error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to remove from storage:", error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Failed to clear storage:", error);
    }
  },
};

/**
 * Debounce function to prevent rapid API calls
 */
export function secureDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for rate limiting user actions
 */
export function secureThrottle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
