"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"

export interface Transaction {
  id: string
  type: "stake" | "unstake" | "trade" | "vault_deposit" | "vault_withdraw" | "intent" | "claim"
  amount: number
  token: string
  status: "pending" | "completed" | "failed"
  timestamp: Date
  hash: string
  description: string
  details?: {
    leverage?: number
    side?: "long" | "short"
    vaultName?: string
    intentName?: string
    apy?: number
  }
}

interface WalletContextType {
  isConnected: boolean
  address: string | null
  publicKey: string | null
  balance: number
  connect: () => Promise<void>
  disconnect: () => void
  isConnecting: boolean
  error: string | null
  isCasperWalletInstalled: boolean
  transactions: Transaction[]
  addTransaction: (tx: Omit<Transaction, "id" | "timestamp" | "hash">) => Promise<Transaction>
  deductBalance: (amount: number) => boolean
  addBalance: (amount: number) => void
}

declare global {
  interface Window {
    CasperWalletProvider?: () => CasperWalletProviderType
  }
}

interface CasperWalletProviderType {
  requestConnection: () => Promise<boolean>
  disconnectFromSite: () => Promise<boolean>
  getActivePublicKey: () => Promise<string>
  isConnected: () => Promise<boolean>
  signMessage: (message: string, signingPublicKey: string) => Promise<string>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Generate random transaction hash
const generateTxHash = () => {
  const chars = "0123456789abcdef"
  let hash = "0x"
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [balance, setBalance] = useState(0)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCasperWalletInstalled, setIsCasperWalletInstalled] = useState(false)
  const [walletProvider, setWalletProvider] = useState<CasperWalletProviderType | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Load transactions from localStorage
  useEffect(() => {
    const savedTx = localStorage.getItem("casperTransactions")
    if (savedTx) {
      try {
        const parsed = JSON.parse(savedTx)
        setTransactions(parsed.map((tx: Transaction) => ({
          ...tx,
          timestamp: new Date(tx.timestamp)
        })))
      } catch (e) {
        console.error("Error loading transactions:", e)
      }
    }
  }, [])

  // Save transactions to localStorage
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem("casperTransactions", JSON.stringify(transactions))
    }
  }, [transactions])

  // Check if Casper Wallet is installed
  useEffect(() => {
    const checkWallet = () => {
      const installed = typeof window !== "undefined" && typeof window.CasperWalletProvider !== "undefined"
      setIsCasperWalletInstalled(installed)
      if (installed && window.CasperWalletProvider) {
        setWalletProvider(window.CasperWalletProvider())
      }
    }
    
    // Wait for wallet to be injected
    const timer = setTimeout(checkWallet, 100)
    return () => clearTimeout(timer)
  }, [])

  // Format public key to account hash (simplified)
  const formatAddress = (pubKey: string) => {
    if (!pubKey) return null
    // Return shortened format for display
    return pubKey
  }

  // Fetch balance from Casper node (simulated for demo)
  const fetchBalance = useCallback(async (pubKey: string) => {
    try {
      // Check if we have a saved balance
      const savedBalance = localStorage.getItem("casperBalance")
      if (savedBalance) {
        setBalance(parseFloat(savedBalance))
        return
      }
      
      // Initial demo balance (50,000 CSPR)
      const initialBalance = 50000
      setBalance(initialBalance)
      localStorage.setItem("casperBalance", initialBalance.toString())
    } catch (err) {
      console.error("Error fetching balance:", err)
      setBalance(0)
    }
  }, [])

  // Deduct balance for transactions
  const deductBalance = useCallback((amount: number): boolean => {
    if (amount > balance) {
      return false
    }
    const newBalance = balance - amount
    setBalance(newBalance)
    localStorage.setItem("casperBalance", newBalance.toString())
    return true
  }, [balance])

  // Add balance (for rewards, unstaking, etc.)
  const addBalance = useCallback((amount: number) => {
    const newBalance = balance + amount
    setBalance(newBalance)
    localStorage.setItem("casperBalance", newBalance.toString())
  }, [balance])

  // Simulate small balance fluctuations from staking/yield (real-time feel)
  useEffect(() => {
    if (!isConnected || balance === 0) return

    const interval = setInterval(() => {
      // Add tiny yield increment (0.01% per minute = ~5% APY)
      const yieldAmount = balance * 0.0001 / 60
      const newBalance = balance + yieldAmount
      setBalance(newBalance)
      localStorage.setItem("casperBalance", newBalance.toString())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [isConnected, balance])

  // Add transaction
  const addTransaction = useCallback(async (tx: Omit<Transaction, "id" | "timestamp" | "hash">): Promise<Transaction> => {
    const newTx: Transaction = {
      ...tx,
      id: Date.now().toString(),
      timestamp: new Date(),
      hash: generateTxHash(),
      status: "pending"
    }
    
    setTransactions(prev => [newTx, ...prev])
    
    // Simulate transaction processing
    await new Promise(r => setTimeout(r, 1500))
    
    // Update transaction status
    setTransactions(prev => prev.map(t => 
      t.id === newTx.id ? { ...t, status: "completed" as const } : t
    ))
    
    return { ...newTx, status: "completed" }
  }, [])

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!walletProvider) return
      
      const wasConnected = localStorage.getItem("casperWalletConnected")
      if (!wasConnected) return

      try {
        const connected = await walletProvider.isConnected()
        if (connected) {
          const activeKey = await walletProvider.getActivePublicKey()
          setPublicKey(activeKey)
          setAddress(formatAddress(activeKey))
          setIsConnected(true)
          fetchBalance(activeKey)
        }
      } catch (err) {
        // Silently handle wallet check errors (wallet not installed or locked)
        if (err && Object.keys(err as object).length > 0) {
          console.warn("Wallet check:", err instanceof Error ? err.message : "Wallet unavailable")
        }
        localStorage.removeItem("casperWalletConnected")
      }
    }
    
    checkConnection()
  }, [walletProvider, fetchBalance])

  // Listen for wallet events
  useEffect(() => {
    const handleConnected = async (event: CustomEvent) => {
      try {
        if (walletProvider) {
          const activeKey = await walletProvider.getActivePublicKey()
          setPublicKey(activeKey)
          setAddress(formatAddress(activeKey))
          setIsConnected(true)
          localStorage.setItem("casperWalletConnected", "true")
          fetchBalance(activeKey)
        }
      } catch (err) {
        console.error("Error handling connection:", err)
      }
    }

    const handleDisconnected = () => {
      setIsConnected(false)
      setAddress(null)
      setPublicKey(null)
      setBalance(0)
      localStorage.removeItem("casperWalletConnected")
    }

    const handleActiveKeyChanged = async (event: CustomEvent) => {
      if (event.detail?.activeKey) {
        setPublicKey(event.detail.activeKey)
        setAddress(formatAddress(event.detail.activeKey))
        fetchBalance(event.detail.activeKey)
      }
    }

    window.addEventListener("casper-wallet:connected", handleConnected as unknown as EventListener)
    window.addEventListener("casper-wallet:disconnected", handleDisconnected)
    window.addEventListener("casper-wallet:activeKeyChanged", handleActiveKeyChanged as unknown as EventListener)

    return () => {
      window.removeEventListener("casper-wallet:connected", handleConnected as unknown as EventListener)
      window.removeEventListener("casper-wallet:disconnected", handleDisconnected)
      window.removeEventListener("casper-wallet:activeKeyChanged", handleActiveKeyChanged as unknown as EventListener)
    }
  }, [walletProvider, fetchBalance])

  // Connect wallet
  const connect = async () => {
    if (!walletProvider) {
      // Open Casper Wallet download page
      window.open("https://www.casperwallet.io/", "_blank")
      setError("Please install Casper Wallet to continue")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const connected = await walletProvider.requestConnection()
      
      if (connected) {
        const activeKey = await walletProvider.getActivePublicKey()
        setPublicKey(activeKey)
        setAddress(formatAddress(activeKey))
        setIsConnected(true)
        localStorage.setItem("casperWalletConnected", "true")
        await fetchBalance(activeKey)
      } else {
        setError("Connection rejected. Please approve the connection in Casper Wallet.")
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || "Failed to connect wallet")
      console.error("Connection error:", err)
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet
  const disconnect = async () => {
    if (walletProvider) {
      try {
        await walletProvider.disconnectFromSite()
      } catch (err) {
        console.error("Error disconnecting:", err)
      }
    }
    setIsConnected(false)
    setAddress(null)
    setPublicKey(null)
    setBalance(0)
    localStorage.removeItem("casperWalletConnected")
  }

  return (
    <WalletContext.Provider value={{ 
      isConnected, 
      address, 
      publicKey,
      balance, 
      connect, 
      disconnect, 
      isConnecting,
      error,
      isCasperWalletInstalled,
      transactions,
      addTransaction,
      deductBalance,
      addBalance,
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
