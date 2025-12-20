"use client"

import { useState } from "react"
import { useWallet, Transaction } from "@/contexts/wallet-context"
import { 
  X, ExternalLink, Copy, CheckCircle, Clock, XCircle,
  TrendingUp, TrendingDown, Coins, Vault, Zap, Gift,
  ChevronDown, ArrowUpRight, ArrowDownLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface TransactionHistoryProps {
  isOpen: boolean
  onClose: () => void
}

const txTypeConfig: Record<Transaction["type"], { icon: React.ElementType; color: string; label: string }> = {
  trade: { icon: TrendingUp, color: "text-blue-500", label: "Trade" },
  stake: { icon: Coins, color: "text-green-500", label: "Stake" },
  unstake: { icon: ArrowUpRight, color: "text-orange-500", label: "Unstake" },
  vault_deposit: { icon: ArrowDownLeft, color: "text-purple-500", label: "Vault Deposit" },
  vault_withdraw: { icon: ArrowUpRight, color: "text-pink-500", label: "Vault Withdraw" },
  intent: { icon: Zap, color: "text-cyan-500", label: "Intent Execution" },
  claim: { icon: Gift, color: "text-yellow-500", label: "Claim Rewards" },
}

export function TransactionHistory({ isOpen, onClose }: TransactionHistoryProps) {
  const { transactions, balance } = useWallet()
  const [filter, setFilter] = useState<"all" | Transaction["type"]>("all")
  const [copied, setCopied] = useState<string | null>(null)

  if (!isOpen) return null

  const filteredTx = filter === "all" 
    ? transactions 
    : transactions.filter(tx => tx.type === filter)

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
    setCopied(hash)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Transaction History</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Wallet Balance: <span className="font-semibold text-pink-500">{balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} CSPR</span>
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filter === "all"
                ? "bg-pink-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {Object.entries(txTypeConfig).map(([type, config]) => (
            <button
              key={type}
              onClick={() => setFilter(type as Transaction["type"])}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filter === type
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredTx.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">Your transactions will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTx.map((tx) => {
                const config = txTypeConfig[tx.type]
                const Icon = config.icon
                
                return (
                  <div key={tx.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center ${config.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{config.label}</span>
                          {getStatusIcon(tx.status)}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 truncate">{tx.description}</p>
                        
                        {/* Transaction Hash */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400 font-mono">
                            {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                          </span>
                          <button
                            onClick={() => copyHash(tx.hash)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            {copied === tx.hash ? (
                              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </button>
                          <a
                            href={`https://cspr.live/deploy/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                          </a>
                        </div>

                        {/* Additional Details */}
                        {tx.details && (
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            {tx.details.leverage && (
                              <span className="px-2 py-0.5 bg-gray-100 rounded">
                                {tx.details.leverage}x Leverage
                              </span>
                            )}
                            {tx.details.side && (
                              <span className={`px-2 py-0.5 rounded ${
                                tx.details.side === "long" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                              }`}>
                                {tx.details.side.toUpperCase()}
                              </span>
                            )}
                            {tx.details.apy && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded">
                                {tx.details.apy}% APY
                              </span>
                            )}
                            {tx.details.vaultName && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded">
                                {tx.details.vaultName}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Amount & Time */}
                      <div className="text-right">
                        <div className={`font-bold ${
                          tx.type === "unstake" || tx.type === "vault_withdraw" || tx.type === "claim"
                            ? "text-green-500"
                            : "text-foreground"
                        }`}>
                          {tx.type === "unstake" || tx.type === "vault_withdraw" || tx.type === "claim" ? "+" : "-"}
                          {tx.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {tx.token}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {formatTime(tx.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {filteredTx.length} transaction{filteredTx.length !== 1 ? "s" : ""}
            </span>
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg hover:shadow-pink-500/25"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
