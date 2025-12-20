/**
 * Web3 Security Utilities
 * Specific security measures for blockchain interactions
 */

/**
 * Validate Ethereum address
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction signature
 */
export function validateSignature(
  message: string,
  signature: string,
  expectedAddress: string
): boolean {
  // Basic validation - implement proper signature verification in production
  if (!signature || signature.length !== 132) return false;
  if (!isValidEthereumAddress(expectedAddress)) return false;
  return true;
}

/**
 * Sanitize transaction data before signing
 */
export function sanitizeTransactionData(tx: {
  to: string;
  value: string;
  data?: string;
  gasLimit?: string;
}): boolean {
  // Validate recipient address
  if (!isValidEthereumAddress(tx.to)) {
    throw new Error("Invalid recipient address");
  }

  // Validate value is numeric
  if (!/^\d+$/.test(tx.value)) {
    throw new Error("Invalid transaction value");
  }

  // Check for suspicious data
  if (tx.data) {
    // Verify data is hex
    if (!/^0x[a-fA-F0-9]*$/.test(tx.data)) {
      throw new Error("Invalid transaction data");
    }
  }

  return true;
}

/**
 * Verify contract address is not in blacklist
 */
const CONTRACT_BLACKLIST = new Set<string>([
  // Add known malicious contract addresses
]);

export function isContractSafe(address: string): boolean {
  if (!isValidEthereumAddress(address)) return false;
  return !CONTRACT_BLACKLIST.has(address.toLowerCase());
}

/**
 * Prevent common Web3 phishing attacks
 */
export function detectPhishingAttempt(params: {
  requestingDomain: string;
  expectedDomain: string;
  amount?: string;
  recipientAddress?: string;
}): { safe: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Check domain similarity
  if (params.requestingDomain !== params.expectedDomain) {
    warnings.push("Domain mismatch detected");
  }

  // Check for suspicious amounts
  if (params.amount && BigInt(params.amount) > BigInt("1000000000000000000000")) {
    warnings.push("Unusually large amount requested");
  }

  // Check recipient against known addresses
  if (params.recipientAddress && !isContractSafe(params.recipientAddress)) {
    warnings.push("Recipient address is flagged as suspicious");
  }

  return {
    safe: warnings.length === 0,
    warnings,
  };
}

/**
 * Secure wallet connection
 */
export async function secureWalletConnect(
  provider: any
): Promise<{ success: boolean; address?: string; error?: string }> {
  try {
    if (!provider) {
      return { success: false, error: "No wallet provider found" };
    }

    // Request accounts
    const accounts = await provider.request({ method: "eth_requestAccounts" });

    if (!accounts || accounts.length === 0) {
      return { success: false, error: "No accounts found" };
    }

    const address = accounts[0];

    // Validate address
    if (!isValidEthereumAddress(address)) {
      return { success: false, error: "Invalid wallet address" };
    }

    return { success: true, address };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

/**
 * Monitor for suspicious wallet activities
 */
export class WalletMonitor {
  private suspiciousActivityCount = 0;
  private readonly maxSuspiciousActivities = 3;

  logActivity(activity: {
    type: "transaction" | "signature" | "connection";
    details: Record<string, any>;
  }): void {
    // Check for suspicious patterns
    if (this.isSuspicious(activity)) {
      this.suspiciousActivityCount++;
      
      if (this.suspiciousActivityCount >= this.maxSuspiciousActivities) {
        this.lockWallet();
      }
    }
  }

  private isSuspicious(activity: {
    type: string;
    details: Record<string, any>;
  }): boolean {
    // Implement suspicion detection logic
    // Example: Multiple failed transactions, unusual amounts, etc.
    return false;
  }

  private lockWallet(): void {
    console.warn("⚠️ Suspicious activity detected. Wallet locked.");
    // Implement wallet locking mechanism
    // Disconnect wallet, show warning, etc.
  }

  reset(): void {
    this.suspiciousActivityCount = 0;
  }
}

export const walletMonitor = new WalletMonitor();
